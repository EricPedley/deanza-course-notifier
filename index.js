const fetch = require("node-fetch")
const fs = require('fs');
const FormData = require("form-data")

require("dotenv").config()

const domain = process.env.MAILGUN_DOMAIN
const key = process.env.MAILGUN_KEY


function sendEmail(subject,text) {
    const url = `https://api.mailgun.net/v3/${domain}/messages`;
    const data = {
        to: "deanzacoursenotifier@gmail.com",
        from: `mailgun@${domain}`,
        subject: subject,
        text: text
    }
    const formData = new FormData()
    for (const name in data) {
        formData.append(name, data[name]);
    }
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Basic ${Buffer.from(`api:${key}`).toString('base64')}`
        },
        body: formData
    }
    fetch(url, options).then(res => { console.log(res); return res.text() }).then(text=>console.log(`mailgun response: ${text}`))
}


const dept = "CIS"
const term = "W2021"//winter 2021
const courseName = "Data Abstraction and Structures"

function checkStatus(dept, term, courseName,doSendEmail) {
    const statuses = Buffer.from(fs.readFileSync("statuses.txt")).toString().split("\n").reduce((accumulator, line) => {
        const info = line.split(":")
        if(info[0])
            accumulator[info[0]] = info[1]
        return accumulator
    }, {})
    fetch(`https://www.deanza.edu/schedule/listings.html?dept=${dept}&t=${term}`).then(res => res.text()).then(text => {
        const matches = text.matchAll(new RegExp(`(\\d{5}).*label-seats">(.*)<\\/span>.*${courseName}.*">(.*)<\\/a><`, "g"));
        const changes = []
        for (const match of matches) {
            if (statuses[match[1]] != match[2]) {
                changes.push([match[1], statuses[match[1]], match[2],match[3]])
                statuses[match[1]] = match[2]
            }
        }
        const newStatuses = Object.keys(statuses).reduce((prev, key) => `${prev}${key}:${statuses[key]}\n`, "")

        if (changes.length > 0) {
            const message = changes.reduce((prev, curr) => `${prev}${curr[0]} (${curr[3]}) changed from ${curr[1]} to ${curr[2]}.\n`, "")
            console.log(message)
            fs.writeFileSync("statuses.txt", newStatuses)
            if(doSendEmail) {
                sendEmail("Course Status Notification",message)
            }
        } else {
            console.log("no changes")
        }
    })
}

checkStatus(dept,term,courseName,true);

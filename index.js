const fetch = require("node-fetch")
const fs = require('fs');
const FormData = require("form-data")


const dept = "CIS"//The prefix for the department the course is in
const term = "W2021"//first letter of the quarter followed by the year. For example, Winter 2021 would be W2021
const courseName = "Data Abstraction and Structures"//the name of the course as it appears on the schedule page
const recipient = "deanzacoursenotifier@gmail.com"//set this to your own email
const emailOption = "onopen"//Values for emailOption: 
//"onpositive" only sends the email if there is a positive change, like going from Full to WL or WL to Open.
//"onopen" only sends the email if a course has changed to open
//"always" sends the email for all changes
//"never" never sends the email(or you can put any other string and it will also not send)

if (!process.env.MAILGUN_DOMAIN)
    require("dotenv").config()

const domain = process.env.MAILGUN_DOMAIN
const key = process.env.MAILGUN_KEY

function sendEmail(subject, text, recipient) {
    const url = `https://api.mailgun.net/v3/${domain}/messages`;
    const data = {
        to: recipient,
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
    fetch(url, options).then(res => res.text()).then(text => console.log(`mailgun response: ${text}`))
}


//Values for emailOption: 
//"onpositive" only sends the email if there is a positive change, like going from Full to WL or WL to Open.
//"onopen" only sends the email if a course has changed to open
//"always" sends the email for all changes
//"never" never sends the email(or you can put any other string and it will also not send)
function checkStatus(dept, term, courseName, emailOption) {
    const statuses = Buffer.from(fs.readFileSync("statuses.txt")).toString().split("\n").reduce((accumulator, line) => {
        const info = line.split(":")
        if (info[0])
            accumulator[info[0]] = info[1]
        return accumulator
    }, {})
    fetch(`https://www.deanza.edu/schedule/listings.html?dept=${dept}&t=${term}`).then(res => res.text()).then(text => {
        const matches = text.matchAll(new RegExp(`(\\d{5}).*(\\d\\d\\w).*label-seats">(.*)<\\/span>.*${courseName.replace("(","\\(").replace(")","\\)")}.*">(.*)<\\/a><`, "g"));
        const changes = []
        /*
        Example match:
        Full:*the full match(not this literal text, but the full regex match)*
        Group 1: 34068
        Group 2: 54Z
        Group 3: Full
        Group 4: Manish Goel
        */
        for (const match of matches) {
            if (statuses[match[1]] != match[3]) {
                changes.push([match[1], statuses[match[1]], match[2], match[3], match[4]])
                statuses[match[1]] = match[3]
            }
        }
        const newStatuses = Object.keys(statuses).reduce((prev, key) => `${prev}${key}:${statuses[key]}\n`, "")
        const statusValues = {
            Full: 0,
            WL: 1,
            Open: 2
        }
        if (changes.length > 0) {
            let positiveChanges = false
            let openings=false
            changes.forEach(change => {
                if (statusValues[change[3]] > statusValues[change[1]])
                    positiveChanges = true
                if(change[3]=="Open")
                    openings=true
            });
            const message = changes.reduce((prev, curr) => `${prev}${curr[0]} (${curr[2]}) with ${curr[4]} changed from ${curr[1]} to ${curr[3]}.\n`, "")
            console.log(message)
            fs.writeFileSync("statuses.txt", newStatuses)
            if (emailOption == "always" || (emailOption == "onpositive" && positiveChanges) || (emailOption=="onopen"&&openings)) {
                sendEmail(`${courseName} Status Change`, message, recipient)
            } else {
                console.log("did not send email")
            }
        } else {
            console.log(`no changes at ${new Date()}`)
        }
    })
}

checkStatus(dept, term, courseName, emailOption);

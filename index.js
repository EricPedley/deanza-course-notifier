const fetch = require("node-fetch")
const fs = require('fs');
const nodemailer = require("nodemailer")


const dept = "CIS"//The prefix for the department the course is in
const term = "W2021"//first letter of the quarter followed by the year. For example, Winter 2021 would be W2021
const courseName = "Data Abstraction and Structures"//the name of the course as it appears on the schedule page
const recipient = "example_address@yahoo.com"//set this to your own email. can be any email provider.
const emailOption = "onopen"//Values for emailOption: 
//"onpositive" only sends the email if there is a positive change, like going from Full to WL or WL to Open.
//"onopen" only sends the email if a course has changed to open
//"always" sends the email for all changes
//"never" never sends the email(or you can put any other string and it will also not send)
const host = "smtp.gmail.com"//if you aren't using gmail to send the email you need to change this
const port = 587//this might be different for different smtp servers. for gmail it's 587

if (!process.env.EMAIL_USER)
    require("dotenv").config()

const user = process.env.EMAIL_USER
const pass = process.env.EMAIL_PASS

const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
        user: user,
        pass: pass
    }
})

function sendEmail(subject, text, recipient) {
    transporter.sendMail({
        from: user,
        to: recipient,
        subject: subject,
        text: text
    })
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
        const matches = text.matchAll(new RegExp(`(\\d{5}).*(\\d\\d\\w).*label-seats">(.*)<\\/span>.*${courseName.replace("(", "\\(").replace(")", "\\)")}.*">(.*)<\\/a><`, "g"));
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
            let openings = false
            changes.forEach(change => {
                if (statusValues[change[3]] > statusValues[change[1]])
                    positiveChanges = true
                if (change[3] == "Open")
                    openings = true
            });
            const message = changes.reduce((prev, curr) => `${prev}${curr[0]} (${curr[2]}) with ${curr[4]} changed from ${curr[1]} to ${curr[3]}.\n`, "")
            console.log(message)
            fs.writeFileSync("statuses.txt", newStatuses)
            if (emailOption == "always" || (emailOption == "onpositive" && positiveChanges) || (emailOption == "onopen" && openings)) {
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

const fetch = require("node-fetch")
const fs = require('fs');

const useTwilio = false

if(useTwilio) {
    require("dotenv").config()
    const accountSid = process.env.TWILIO_SID
    const authToken = process.env.TWILIO_TOKEN
    const client = require('twilio')(accountSid,authToken);
    const phoneNumber = process.env.PHONE_NUMBER
    
    function makeCall() {
        client.calls.create({
            url:'http://demo.twilio.com/docs/voice.xml',
            to:`+${phoneNumber}`,
            from:"+12057548558"
        }).then(call=>console.log(call.sid))
    }
}


const statuses = {}
Buffer.from(fs.readFileSync("statuses.txt")).toString().split("\n").forEach(line=>{
    const info = line.split(":")
    statuses[info[0]]=info[1]
})
fetch("https://www.deanza.edu/schedule/listings.html?dept=CIS&t=W2021").then(res=>res.text()).then(text=>{
    const matches = text.matchAll(/(\d{5}).*label-seats">(.*)<\/span>.*Data Abstraction and Structures/g);
    const changes = []
    for(match of matches) {
        if(statuses[match[1]]!=match[2]) {
            changes.push([match[1],statuses[match[1]],match[2]])
            statuses[match[1]]=match[2]
        }
    }
    let newStatuses = ""
    for(key of Object.keys(statuses)) {
        if(key)
            newStatuses+=`${key}:${statuses[key]}\n`
    }
    if(changes.length>0){
        const message = changes.reduce((prev,curr)=>`${prev}${curr[0]} changed from ${curr[1]} to ${curr[2]}. `,"")
        console.log(message)
        fs.writeFileSync("statuses.txt",newStatuses)
    }
})
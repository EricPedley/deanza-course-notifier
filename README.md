# deanza-course-notifier

Checks De Anza College course listings page and detects status changes for courses

## Setup

### Requirements:
- Nodejs version greater than 12.0.0 (tested on 14.15.1)
- NPM (tested on 6.14.8)
- [Mailgun](https://www.mailgun.com/) account

### Steps:
1. Clone git repository or download zip
2. Run `npm install` in the wokring directory(the directory that contains index.js)
3. Create a file called ".env" in that same directory and type in the following lines:  
  MAILGUN_KEY={your mailgun api key(don't include the curly braces)}  
  MAILGUN_DOMAIN={your mailgun domain. ex: sandbox5794837528346587613451.mailgun.org}
4. Open index.js in your text editor and change the constants "recipient", "dept", "term", and "courseName" to your preferences
5. Run index.js with command "node index.js"
6. You can set the script up to run automatically using cron jobs on Mac or Linux, or using task scheduler on Windows

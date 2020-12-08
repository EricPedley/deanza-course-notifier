# deanza-course-notifier

Checks De Anza College course listings page and detects status changes for courses

## Setup

### Requirements:
- Nodejs version greater than 12.0.0 (tested on 14.15.1)
- NPM (tested on 6.14.8)
- Email account (tested with gmail)

### Steps:
1. Clone git repository or download zip and extract
2. Run `npm install` in the working directory(the directory that contains index.js)
3. Create a file called ".env" in that same directory and type in the following lines:  
  EMAIL_USER={your email address, including the @gmail.com, don't type these curly braces}  
  EMAIL_PASS={your email [app password](https://support.google.com/accounts/answer/185833?hl=en) (without spaces)}
4. Open index.js in your text editor and change the constants "recipient", "dept", "term", and "courseName" to your preferences. If you aren't using gmail, you will have to change the "host" and "port" constants to match your email provider's SMTP server.
5. Run index.js with command "node index.js"
6. You can set the script up to run automatically using cron jobs on Mac or Linux, or using task scheduler on Windows

- If you find this project helpful, give the repo a star and I'll make a Youtube tutorial if it gets enough attention

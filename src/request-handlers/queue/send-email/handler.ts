//import { SQSHandler } from 'aws-lambda'

// const run: SQSHandler = async (event, _context) => {
//     for (let record of event.Records) {
//         const email: Email = JSON.parse(record.body);
//         console.log('JavaScript queue trigger function processed work item', record);
//         console.log('body is', email);
//         const apiKey = <string>process.env['SENDGRID_API_KEY'];
//         console.log(`api key is ${apiKey}`);
//         SendGrid.setApiKey(apiKey);
//         const msg = {
//             to: email.to,
//             from: email.from,
//             cc: email.cc,
//             subject: email.subject,
//             html: email.body
//         }
//         await SendGrid.send(msg);
//         console.log('sent the message', msg);
//     }
// }
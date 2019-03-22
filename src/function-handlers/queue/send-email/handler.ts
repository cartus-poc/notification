import { SQSHandler } from 'aws-lambda'
import sendGrid from '@sendgrid/mail'
import Email from './Email'
import { MailData } from '@sendgrid/helpers/classes/mail';

const apiKey = process.env.SENDGRID_API_KEY
sendGrid.setApiKey(apiKey);

export const run: SQSHandler = async (event, _context) => {
    try {
        for (let record of event.Records) {
            const email: Email = JSON.parse(record.body);
            const msg: MailData = {
                to: email.to,
                from: email.from,
                cc: email.cc,
                bcc: email.bcc,
                subject: email.subject,
                html: email.html,
                text: email.text
            }
            await sendGrid.send(msg);
            console.log('sent the message', msg);
        }
    } catch (ex) {
        console.error('error', ex)
    }
}
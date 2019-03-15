import { APIGatewayProxyHandler } from 'aws-lambda'
// import { SES } from 'aws-sdk'
// import nodemailer from 'nodemailer'
import mustache from 'mustache'
import sendGrid from '@sendgrid/mail'
import { Payload, schema } from './payload'
import { Response } from './response'
import { errorResponse } from '../../utility/http/errors'
import * as validation from '../../utility/http/validation'

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

export const post: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const { error, payload } = validation.validateRequestBody<Payload>(event.body, schema)
        if (error) return error
        //Render the template for email body
        const template = (typeof payload.template !== 'string') ?
            mustache.render(payload.template.wrapper, { content: payload.template.content }) : //Object w/ wrapper and content
            payload.template //Full template provided as string

        const emailBody = mustache.render(template, payload.render)

        const email: Response = {
            to: payload.to,
            from: payload.from,
            cc: payload.cc,
            bcc: payload.bcc,
            subject: payload.subject,
        }

        if (payload.html) email.html = emailBody; else email.text = emailBody

        await sendGrid.send({ ...email })

        return {
            statusCode: 200,
            body: JSON.stringify(email),
        }

    } catch (ex) {
        console.error('error', ex)
        return errorResponse(500, {
            name: 'INTERNAL_SERVER_ERR',
            message: 'Internal Server Error. Please try again later'
        })
    }
}

// export const sESEmailParams = (payload: Payload, emailBody: string): SES.SendEmailRequest => {
//     return {
//         Source: payload.from,
//         Destination: {
//             ToAddresses: payload.to,
//             CcAddresses: payload.cc,
//             BccAddresses: payload.bcc
//         },
//         Message: {
//             Body: {
//                 Html: {
//                     Charset: 'UTF-8',
//                     Data: emailBody
//                 }
//             },
//             Subject: {
//                 Charset: 'UTF-8',
//                 Data: payload.subject
//             }
//         }
//     }
// }

import { APIGatewayProxyHandler } from 'aws-lambda'
// import { SES } from 'aws-sdk'
// import nodemailer from 'nodemailer'
import mustache from 'mustache'
import { Payload, schema } from './payload'
import { Response } from './response'
import { errorResponse } from '../../utility/http/errors'
import * as validation from '../../utility/http/validation'
// import util from 'util';

// const ses = new SES();

export const post: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const { error, payload } = validation.validateRequestBody<Payload>(event.body, schema)
        if (error) return error
        //Render the template for email body
        //Wrapper -> <html><body>{{{content}}}</body></html>
        //Content -> <h1>{{name}}</h1>
        //Combined -> <html><body><h1>{{name}}</h1></body></html>
        //Render Obejct -> { name: 'Doug' }
        //Final Render -><html><body><h1>Doug</h1></body></html>
        const template = (typeof payload.template !== 'string') ?
            mustache.render(payload.template.wrapper, { content: payload.template.content }) : //Object w/ wrapper and content
            payload.template //Full template provided as string

        const emailBody = mustache.render(template, payload.render)

        // const transporter = nodemailer.createTransport({
        //     host: 'smtp.cartus.com',
        //     port: 25,
        //     secure: false,
        //     ignoreTLS: true
        // })

        // const info = await transporter.sendMail({
        //     sender: 'douglas.gerhardt@cartus.com',
        //     to: payload.to,
        //     cc: payload.cc,
        //     bcc: payload.bcc,
        //     subject: payload.subject
        // })
        // console.log('got the info', info)
        // const res = await ses.sendEmail(sESEmailParams(payload, emailBody)).promise()   

        // console.log(res)
        //Stage to a queue


        const res: Response = {
            to: payload.to,
            from: payload.from,
            cc: payload.cc,
            bcc: payload.bcc,
            subject: payload.subject,
            body: emailBody
        }

        return {
            statusCode: 200,
            body: JSON.stringify(res),
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

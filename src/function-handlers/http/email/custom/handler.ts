import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { SQS } from 'aws-sdk'
import mustache from 'mustache'
import { Payload, schema } from './payload'
import { Response } from './response'
import { errorResponse, validationErrorResponse, ErrorDetail } from '../../../../utility/http/errors'
import * as validation from '../../../../utility/http/validation'
import { sendSQSMessage } from '../../../../utility/sqs/sqs'
import restricted from '../address-restriction'
import Email from '../../../queue/send-email/Email'

const sqs = new SQS({ region: process.env.REGION })

export const post: APIGatewayProxyHandler = async (event, _context) => {
    try {
        const { error, payload } = validation.validateRequestBody<Payload>(event.body, schema)
        if (error) return error

        //Make sure we do not send email to not allowed domains
        const restrictedDomainError = getRestrictedAddressErrors(payload)
        if (restrictedDomainError) return restrictedDomainError

        //Render the template for email body
        const template = (typeof payload.template !== 'string') ?
            mustache.render(payload.template.wrapper, { content: payload.template.content }) : //Object w/ wrapper and content
            payload.template //Full template provided as string

        const emailBody = mustache.render(template, payload.render)

        const email: Email = {
            to: payload.to,
            from: payload.from,
            cc: payload.cc,
            bcc: payload.bcc,
            subject: payload.subject,
        }

        //Determine if email should be html or text
        if (payload.html) email.html = emailBody; else email.text = emailBody

        const queueUrl = `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.ACCOUNT_ID}/${process.env.EMAIL_QUEUE_NAME}`
        const sqsRes = await sendSQSMessage(sqs, {
            MessageBody: JSON.stringify(email),
            QueueUrl: queueUrl
        });

        const res: Response = {
            queueId: sqsRes.MessageId,
            email
        };

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

export const getRestrictedAddressErrors = (payload: Payload): APIGatewayProxyResult => {
    console.log(process.env.RESTRICT_ADDRESSES)
    if (!process.env.RESTRICT_ADDRESSES || process.env.RESTRICT_ADDRESSES == 'false') return null //Only if we are restricting
    const addressFieldsToCheck = ['to', 'from', 'cc', 'bcc'] //Check these for invalid domains
    const allowedDomains = restricted.allowedDomains// Comma seperated list
        .map(domain => domain.toLowerCase()) //Make them lower case
    const allowedAddresses = restricted.allowedAddresses
        .map(domain => domain.toLowerCase()) //Make them lower case
    const normalizeArr = (val: string | string[]) => { return (typeof val === 'string') ? [val] : val }
    let errs: ErrorDetail[] = []
    //Creates an array of objects with values joined by pipe. Also retains the field name
    interface Address { field: string, values: string[] }
    const addresses: Address[] = addressFieldsToCheck.map(field => ({ field, values: normalizeArr(payload[field]) }))

    const addressContainsDomain = (addr: Address) => (addr.values 
        .every(addrValue => allowedDomains //if all of hte address values
            .some(domain => addrValue.toLowerCase().includes(domain)) //... contains at least one of the domains
        )
    )
    const addressIsAllowed = (addr: Address) => (addr.values
        .every(addrValue => allowedAddresses //If all of the address values
            .some(allowedAddr => addrValue.trim().toLowerCase() === allowedAddr.trim().toLowerCase()) //are equal to at least one of the allowed addresses
        )
    )

    for (let address of addresses) { //For each address (to, from etc)
        if (address.values && //If we have anything for that field
            (!addressContainsDomain(address) && !addressIsAllowed(address)) //If it's not valid
        ) {
            errs.push({ //It's an error
                field: address.field,
                value: payload[address.field],
                issue: `The field value references an invalid address or domain. Addresses are restricted to "${allowedAddresses}", or addresses that use the one of the following domains "${allowedDomains}".`,
                location: `/${address.field}`
            })
        }
    }
    if (errs.length > 0) {
        return validationErrorResponse(errs)
    }
    return null;
}

import crypto from 'crypto'
import { ValidationError } from 'joi'
import { APIGatewayProxyResult } from 'aws-lambda';

interface ErrorDetail {
    field: string,
    value: any,
    issue: string,
    location: string
}

interface Error {
    name: string,
    details?: [ErrorDetail],
    debugId?: string,
    message: string,
    informationLink?: string
}

const errorBody = (err: Error) => {
    if (!err.debugId) {
        err.debugId = crypto.randomBytes(16).toString('hex')
    }
    return JSON.stringify(err);
}

export const errorResponse = (statusCode: number, err: Error): APIGatewayProxyResult => {
    return {
        statusCode,
        body: errorBody(err)
    }
}

export const noBodyResponse: APIGatewayProxyResult = {
    statusCode: 400,
    body: errorBody({
        name: 'NO_BODY_ERR',
        message: 'No request body provided. Please '
    })
}

export const invalidJSONResponse: APIGatewayProxyResult = {
    statusCode: 400,
    body: errorBody({
        name: 'INVALID_JSON',
        message: 'JSON body is not valid. Please check the format of your JSON request body.'
    })
}

export const validationErrorResponse = (errors: ValidationError): APIGatewayProxyResult => {
    console.log(errors)
    console.log('path', errors.details[0].path)
    console.log('context', errors.details[0].context)
    let details = errors.details.map(err => {
        const detail: ErrorDetail = {
            field: err.context.key,
            value: err.context.value,
            issue: err.message,
            location: err.path.join('/')
        }
        return detail;
    });
    return {
        statusCode: 400,
        body: JSON.stringify({
            name: 'VALIDATION_ERR',
            message: 'The request body could not be validated. See details',
            details
        })
    }

}
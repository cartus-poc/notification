import crypto from 'crypto'
import joi from 'joi'
import { APIGatewayProxyResult } from 'aws-lambda';

export interface ErrorDetail {
    field: string,
    value: any,
    issue: string,
    location: string
}

export interface Error {
    name: string,
    details?: ErrorDetail[],
    debugId?: string,
    message: string,
    informationLink?: string
}

export const errorBody = (err: Error) => {
    //Don't want accidental side effects.
    const errCopy = { ...err };
    if (!errCopy.debugId) {
        errCopy.debugId = crypto.randomBytes(16).toString('hex')
    }
    return JSON.stringify(errCopy);
}

export const errorResponse = (statusCode: number, err: Error): APIGatewayProxyResult => {
    return {
        statusCode,
        body: errorBody(err)
    }
}

export const noBodyResponse = (): APIGatewayProxyResult => {
    return {
        statusCode: 400,
        body: errorBody({
            name: 'NO_BODY_ERR',
            message: 'No request body provided. A valid request body is required.'
        })
    }
}

export const invalidJSONResponse = (): APIGatewayProxyResult => {
    return {
        statusCode: 400,
        body: errorBody({
            name: 'INVALID_JSON',
            message: 'JSON body is not valid. Please check the format of your JSON request body.'
        })
    }
}

export const joiValidationErrorResponse = (errors: joi.ValidationError): APIGatewayProxyResult => {
    let details = errors.details.map(err => {
        const detail: ErrorDetail = {
            field: err.context.key,
            value: err.context.value,
            issue: err.message,
            location: err.path.join('/')
        }
        return detail;
    });
    return validationErrorResponse(details)
}

export const validationErrorResponse = (details: ErrorDetail[]): APIGatewayProxyResult => {
    return {
        statusCode: 400,
        body: errorBody({
            name: 'VALIDATION_ERR',
            message: 'The request body could not be validated. See details',
            details
        })
    } 
}
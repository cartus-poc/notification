import { APIGatewayProxyResult } from 'aws-lambda';
import joi from 'joi'
import * as errors from './errors'

interface ValidationResponse<T> {
    error?: APIGatewayProxyResult,
    payload?: T
}

export const validateRequestBody = <T>(body: string | undefined | null, schema: joi.ObjectSchema) : ValidationResponse<T> => {
    if (!body) {
        return {
            error: errors.noBodyResponse
        }
    }
    //Make sure the body is valid json
    try { JSON.parse(body) } catch (ex) { return { error: errors.invalidJSONResponse } }
    const { error, value } = joi.validate<T>(JSON.parse(body), schema, { abortEarly: false });
    if (error) {
        return {
            error: errors.validationErrorResponse(error)
        }
    }
    return {
        payload: value
    }
}
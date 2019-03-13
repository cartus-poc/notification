import { APIGatewayProxyResult } from 'aws-lambda';
import joi from 'joi'
import * as errors from '../../utility/http/errors'

interface ValidationResponse {
    error?: APIGatewayProxyResult,
    payload?: any
}

export const validateRequestBody = <T>(body: string | undefined | null, schema: joi.ObjectSchema) : ValidationResponse => {
    if (!body) {
        return {
            error: errors.noBodyResponse
        }
    }
    //Make sure the body is valid json
    try { JSON.parse(body) } catch (ex) { return { error: errors.invalidJSONResponse } }
    const { error, value: payload } = joi.validate<T>(JSON.parse(body), schema, { abortEarly: false });
    if (error) {
        return {
            error: errors.validationErrorResponse(error)
        }
    }
    return {
        payload
    }
}
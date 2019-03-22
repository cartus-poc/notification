import assert from 'assert'
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as errors from './errors';
import sinon from 'sinon'
import joi from 'joi'
import { validateRequestBody } from './validation'


describe('validateRequestBody', () => {
    let event = <APIGatewayProxyEvent>{};
    let schema = <joi.ObjectSchema>{};
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(errors, 'noBodyResponse')
            .returns({
                statusCode: 400,
                body: 'no body'
            })
        sandbox.stub(errors, 'joiValidationErrorResponse')
            .returns({
                statusCode: 400,
                body: 'validation error'
            })
        sandbox.stub(errors, 'invalidJSONResponse')
            .returns({
                statusCode: 400,
                body: 'invalid json'
            })
        event.body = 'abc';
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('should return a "No Body Response" in error property when body is undefined. No payload parameter should be provided', async () => {
        event.body = undefined;
        const actual = validateRequestBody(event.body, schema)
        assert(actual.error)
        assert(!actual.payload)
        assert.deepEqual(actual.error, { statusCode: 400, body: 'no body'} )
    })
    it('should return a "No Body Response" in error property when body is null. No payload parameter should be provided', async () => {
        event.body = null;
        const actual = validateRequestBody(event.body, schema)
        assert(actual.error)
        assert(!actual.payload)
        assert.deepEqual(actual.error, { statusCode: 400, body: 'no body'} )
    })
    it('should return an "Invalid JSON Response" in error property when request body is not valid json. No payload parameter should be provided', async () => {
        event.body = 'not valid json';
        const actual = validateRequestBody(event.body, schema)
        assert(actual.error)
        assert(!actual.payload)
        assert.deepEqual(actual.error, { statusCode: 400, body: 'invalid json'} )
    })
    it('should return a "Validation Error Reponse" in error property when body validation fails in joi. No payload parameter should be provided', async () => {
        event.body = JSON.stringify({ valid: 'json' });
        sandbox.stub(joi, 'validate')
            .returns({ error: 'bad error' });
        const actual = validateRequestBody(event.body, schema)
        assert(actual.error)
        assert(!actual.payload)
        assert.deepEqual(actual.error, { statusCode: 400, body: 'validation error'} )

    })
    it('should return an object with just the payload when no validation errors occur', () => {
        event.body = JSON.stringify({ valid: 'json' });
        sandbox.stub(joi, 'validate')
            .returns({ value: 'payload' }); //good joi validation
        const actual = validateRequestBody(event.body, schema)
        assert(!actual.error)
        assert(actual.payload)
        assert.deepEqual(actual.payload, 'payload')
 
    })
})
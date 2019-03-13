import assert from 'assert'
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import * as errors from '../../utility/http/errors';
import sinon from 'sinon'
import joi from 'joi'
import { run } from './handler'


describe('someFunction', () => {
    let event = <APIGatewayProxyEvent>{};
    let context = <Context>{};
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        
        sandbox.stub(errors, 'errorResponse')
        .callsFake((): any => console.log('Hello there!'))
        .returns({
            statusCode: 500,
            body: 'Bad bad bad'
        })
        sandbox.stub(errors, 'noBodyResponse')
        .value({
            statusCode: 400,
            body: 'no body'
        })
        sandbox.stub(errors, 'validationErrorResponse')
        .returns({
            statusCode: 400,
            body: 'validation error'
        })
        sandbox.stub(errors, 'invalidJSONResponse')
        .value({
            statusCode: 400,
            body: 'invalid json'
        })
        event.body = 'abc';
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('should return a "No Body Response" when body is undefined', async () => {
        event.body = undefined;
        const actual = await run(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual.statusCode, 400)
        assert.deepEqual(actual.body, 'no body') //from stub
    })
    it('should return a "No Body Response" when body is null', async () => {
        event.body = null;
        const actual = await run(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual.statusCode, 400)
        assert.deepEqual(actual.body, 'no body') //from stub
    })
    it('should return an "Invalid JSON Response" when request body is not valid json', async () => {
        event.body = 'not valid json';
        const actual = await run(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual.statusCode, 400)
        assert.deepEqual(actual.body, 'invalid json') //from stub 
    })
    it('should return a "Validation Error Reponse" when body validation fails in joi', async () => {
        event.body = JSON.stringify({ valid: 'json' });
        sandbox.stub(joi, 'validate')
            .returns({ error: 'bad error' });
        const actual = await run(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual.statusCode, 400)
        assert.deepEqual(actual.body, 'validation error') //from stub
    })
})
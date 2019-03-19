import assert from 'assert'
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda'
import sinon from 'sinon'
import * as validation from '../../../../utility/http/validation'
import { post } from './handler'


describe('post', () => {
    let event = <APIGatewayProxyEvent>{};
    let context = <Context>{};
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        event.body = 'abc';
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('should return an error response when validation.validateRequestBody returns an error property', async () => {
        sandbox.stub(validation, 'validateRequestBody')
        .returns({
            error: {
                statusCode: 400,
                body: 'Very bad error'
            }
        });
        const actual = await post(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual, { statusCode: 400, body: 'Very bad error'})
    })

})
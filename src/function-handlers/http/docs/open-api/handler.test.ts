import assert from 'assert'
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda'
import sinon from 'sinon'
import { get } from './handler'
import * as spec from './open-api-spec.yml'

describe('post', () => {
    let event = <APIGatewayProxyEvent>{};
    let context = <Context>{};
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        sandbox.stub(spec, 'default')
            .value('abcdef')
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('should return an response with 200 code', async () => {
        const actual = await get(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual.statusCode, 200)
    })
    it('should set the content-type header of the response to "text"', async () => {
        const actual = await get(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual.headers['content-type'], 'text')
    })
    it('should return the open-api-spec.yml data as the body of the response', async () => {
        const actual = await get(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual.body, 'abcdef')
    })
})



import assert from 'assert'
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda'
import sinon from 'sinon'
import mustache from 'mustache'
import * as validation from '../../../../utility/http/validation'
import * as sqs from '../../../../utility/sqs/sqs'
import { post } from './handler'


describe('post', () => {
    let event = <APIGatewayProxyEvent>{};
    let context = <Context>{};
    const sandbox = sinon.createSandbox();
    let validateRequestBodyStub = <sinon.SinonStub>{}
    let sendSQSMessageStub = <sinon.SinonStub>{}
    let mustacheRenderStub = <sinon.SinonStub>{}
    beforeEach(() => {
        event.body = JSON.stringify({
            template: 'Template as string',
            render: {
                prop1: 'prop1',
                prop2: 'prop2'
            }
        })
        validateRequestBodyStub = sandbox.stub(validation, 'validateRequestBody')
            .callsFake(body => {
                return {
                    payload: JSON.parse(body)
                }
            })
        sendSQSMessageStub = sandbox.stub(sqs, 'sendSQSMessage')
            .returns(Promise.resolve({
                MessageId: 'Message'
            }))
        mustacheRenderStub = sandbox.stub(mustache, 'render')
            .returns('rendered text')
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('should return an error response when validation.validateRequestBody returns an error property', async () => {
        validateRequestBodyStub.restore();
        validateRequestBodyStub = sandbox.stub(validation, 'validateRequestBody')
            .returns({
                error: {
                    statusCode: 400,
                    body: 'Very bad error'
                }
            });
        const actual = await post(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual, { statusCode: 400, body: 'Very bad error' })
    })

    it('should render the template against the render object of the payload directly, when the template property is a string', async () => {
        event.body = JSON.stringify({
            template: 'Template as string',
            render: {
                prop1: 'prop1',
                prop2: 'prop2'
            }
        })

        await post(event, context, x => x) as APIGatewayProxyResult

        assert(mustacheRenderStub.calledOnce)
        assert.deepEqual(mustacheRenderStub.getCall(0).args[0], 'Template as string')
        assert.deepEqual(mustacheRenderStub.getCall(0).args[1], { prop1: 'prop1', prop2: 'prop2' })
    })
    it('should render the template using mustache, giving the wrapper against the content when template is an object', async () => {
        event.body = JSON.stringify({
            template: {
                wrapper: 'wrapper',
                content: 'content'
            },
            render: {
                prop1: 'prop1',
                prop2: 'prop2'
            }
        })
        mustacheRenderStub.restore()
        mustacheRenderStub = sandbox.stub(mustache, 'render')
            .returns('Render Text')

        await post(event, context, x => x) as APIGatewayProxyResult

        assert.deepEqual(mustacheRenderStub.getCall(0).args[0], 'wrapper')
        assert.deepEqual(mustacheRenderStub.getCall(0).args[1], { content: 'content' })
        assert.deepEqual(mustacheRenderStub.getCall(1).args[0], 'Render Text')
        assert.deepEqual(mustacheRenderStub.getCall(1).args[1], { prop1: 'prop1', prop2: 'prop2' })

    })
    it('should return a 500 error when a critical error occurs. It should also log the error', async () => {
        mustacheRenderStub.restore()
        mustacheRenderStub = sandbox.stub(mustache, 'render')
            .throws(new Error('bad bad error'))

        const consoleStub = sandbox.stub(console, 'error')

        const actual = await post(event, context, x => x) as APIGatewayProxyResult

        assert.deepEqual(consoleStub.getCall(0).args[0], 'error')
        assert.deepEqual(consoleStub.getCall(0).args[1].message, 'bad bad error')
        assert.deepEqual(actual.statusCode, 500)
        assert.deepEqual(JSON.parse(actual.body).name, 'INTERNAL_SERVER_ERR')
        assert.deepEqual(JSON.parse(actual.body).message, 'Internal Server Error. Please try again later')
    })

    it('should set the html property of the sqs message object when the payload\'s html flag is true', async () => {
        event.body = JSON.stringify({
            html: true,
            template: {
                wrapper: 'wrapper',
                content: 'context'
            },
            render: {
                prop1: 'prop1',
                prop2: 'prop2'
            }
        })
        await post(event, context, x => x) as APIGatewayProxyResult

        const sqsMessage = JSON.parse(sendSQSMessageStub.getCall(0).args[1].MessageBody)
        assert.deepEqual(sqsMessage.html, 'rendered text')
        assert.deepEqual(sqsMessage.text, undefined)
    })
    it('should set the text property of the sqs message object when the payload html flag is false', async () => {
        event.body = JSON.stringify({
            html: false,
            template: {
                wrapper: 'wrapper',
                content: 'context'
            },
            render: {
                prop1: 'prop1',
                prop2: 'prop2'
            }
        })
        await post(event, context, x => x) as APIGatewayProxyResult

        const sqsMessage = JSON.parse(sendSQSMessageStub.getCall(0).args[1].MessageBody)
        assert.deepEqual(sqsMessage.text, 'rendered text')
        assert.deepEqual(sqsMessage.html, undefined)

    })
    it('should send the SQS Message using the correct queueURL Syntax', async () => {
        sandbox.stub(process, 'env')
            .value({
                REGION: 'REGION',
                ACCOUNT_ID: 'ACCOUNT_ID',
                EMAIL_QUEUE_NAME: 'EMAIL_QUEUE_NAME'
            })

        await post(event, context, x => x) as APIGatewayProxyResult
        const queueURL = sendSQSMessageStub.getCall(0).args[1].QueueUrl
        assert.deepEqual(queueURL, `https://sqs.REGION.amazonaws.com/ACCOUNT_ID/EMAIL_QUEUE_NAME`)

    })
    it('should send the SQS Message with the correct email message object formatted as JSON', async () => {
        event.body = JSON.stringify({
            to: 'to',
            from: 'from',
            cc: 'cc',
            bcc: 'bcc',
            subject: 'subject',
            html: false,
            template: {
                wrapper: 'wrapper',
                content: 'context'
            },
            render: {
                prop1: 'prop1',
                prop2: 'prop2'
            }
        })

        await post(event, context, x => x) as APIGatewayProxyResult
        const sqsMessage = JSON.parse(sendSQSMessageStub.getCall(0).args[1].MessageBody)
        assert.deepEqual(sqsMessage.to, 'to')
        assert.deepEqual(sqsMessage.from, 'from')
        assert.deepEqual(sqsMessage.cc, 'cc')
        assert.deepEqual(sqsMessage.bcc, 'bcc')
        assert.deepEqual(sqsMessage.subject, 'subject')
    })
    it('should return a 200 response when everything works. It should include the queueId from the sqs queue (mapped form MessageId)', async () => {
        event.body = JSON.stringify({
            to: 'to',
            from: 'from',
            cc: 'cc',
            bcc: 'bcc',
            subject: 'subject',
            html: false,
            template: {
                wrapper: 'wrapper',
                content: 'context'
            },
            render: {
                prop1: 'prop1',
                prop2: 'prop2'
            }
        })

        const actual = await post(event, context, x => x) as APIGatewayProxyResult
        assert.deepEqual(actual.statusCode, 200)
        assert.deepEqual(actual.body, JSON.stringify({
            queueId: 'Message',
            email: {
                to: 'to',
                from: 'from',
                cc: 'cc',
                bcc: 'bcc',
                subject: 'subject',
                text: 'rendered text'
            }
        }))
    })
})





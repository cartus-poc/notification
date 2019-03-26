import { SQS } from 'aws-sdk'
import sinon from 'sinon'
import assert from 'assert'
import * as sqs from './sqs'

describe('sendSQSMessage', () => {
    let sandbox = sinon.createSandbox()
    let sqsDep
    let params = <SQS.SendMessageRequest>{}
    beforeEach(() => {
        sqsDep = {
            sendMessage: sandbox.stub()
                .yields(null, 'data')
        }
        params = {
            MessageBody: JSON.stringify({ test: 'test' }),
            QueueUrl: 'http://example.com'
        }
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('should return a promise, and resolve that promise when the sqs.sendMessage succeeds', (done) => {
        let actual = sqs.sendSQSMessage(<SQS>sqsDep, params)
        actual
            .then(data => {
                assert.deepEqual(data, 'data')
                done();
            })
            .catch(err => done(err))
    })
    it('should return a promise, and reject that promise if the sqs.sendMessage fails', (done) => {
        sqsDep.sendMessage = sandbox.stub()
            .yields('error')
        let actual = sqs.sendSQSMessage(<SQS>sqsDep, params)
        actual
            .then(_ => {
                done('error shoudlnt get into the then');
            })
            .catch(err => {
                assert.deepEqual(err, 'error')
                done()
            })
    })
    it('should pass the provided params into the sqs.sendMessage function', (done) => {
        let actual = sqs.sendSQSMessage(<SQS>sqsDep, params)
        actual
            .then(_ => {
                assert.deepEqual(sqsDep.sendMessage.getCall(0).args[0], params)
                done();
            })
            .catch(err => done(err))
    })
})
import aws from 'aws-lambda'
import { run } from './handler'
import sendGrid from '@sendgrid/mail'
import sinon from 'sinon'
import assert from 'assert'
import Email from './Email'

describe('run', () => {
    let sandbox = sinon.createSandbox()
    let sendStub = <sinon.SinonStub>{}
    let event = <aws.SQSEvent>{}
    beforeEach(() => {
        sendStub = sandbox.stub(sendGrid, 'send')
        event.Records = [
            <aws.SQSRecord>{
                body: JSON.stringify(<Email>{
                    to: 'to1',
                    from: 'from1',
                    cc: 'cc1',
                    bcc: 'bcc1',
                    subject: 'subject1',
                    html: 'html1',
                    text: 'text1'
                })
            },
            <aws.SQSRecord>{
                body: JSON.stringify(<Email>{
                    to: 'to2',
                    from: 'from2',
                    cc: 'cc2',
                    bcc: 'bcc2',
                    subject: 'subject2',
                    html: 'html2',
                    text: 'text2'
                })
            }
        ]
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('should send a message using sendgrid for each record on the event object', async () => {
        await run(event, <aws.Context>{}, x => x)
        let i = 1;
        for (let call of sendStub.getCalls()) {
            assert.deepEqual(call.args[0], {
                to: `to${i}`,
                from: `from${i}`,
                cc: `cc${i}`,
                bcc: `bcc${i}`,
                subject: `subject${i}`,
                html: `html${i}`,
                text: `text${i}`
            })
            i++
        }
    })
    it('should log an error given a critical error is thrown', async () => {
        sendStub.restore()
        sendStub = sandbox.stub(sendGrid, 'send')
            .throws(new Error('fake error'))
        const consoleStub = sandbox.stub(console, 'error')
        await run(event, <aws.Context>{}, x => x)
        assert.deepEqual(consoleStub.getCall(0).args[0], 'error')
        assert.deepEqual(consoleStub.getCall(0).args[1].message, 'fake error')
    })
})
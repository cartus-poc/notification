import Email from '../../../queue/send-email/Email'

export interface Response {
    queueId: string,
    email: Email
}

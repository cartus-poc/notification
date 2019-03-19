export interface Response {
    queueId: string,
    email: {
        to: string | string[],
        from: string,
        cc?: string | string[],
        bcc?: string | string[],
        subject: string,
        text?: string,
        html?: string
    }
}
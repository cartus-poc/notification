export interface Response {
    to: string | string[],
    from: string,
    cc?: string | string[],
    bcc?: string | string[],
    subject: string,
    html: string
}
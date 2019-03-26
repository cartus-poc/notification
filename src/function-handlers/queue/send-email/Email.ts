export default interface Email {
    to: string | string[],
    from: string | {
        name?: string,
        email: string
    },
    cc?: string | string[],
    bcc?: string | string[],
    subject: string,
    text?: string,
    html?: string
}
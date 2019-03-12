import * as joi from 'joi'

export interface Payload {
    to: string,
    from?: string,
    cc?: string,
    bcc?: string,
    render: object,
    template: string,
}

export const schema = joi.object().keys({
    to: joi.string().email().max(255).required(),
    from: joi.string().email().max(255).default('do-not-reply@cartus.com'),
    cc: joi.string().email().max(255),
    bcc: joi.string().email().max(255),
    render: joi.object().required(),
    template: joi.string().required()
})
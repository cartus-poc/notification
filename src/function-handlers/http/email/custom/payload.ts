import joi from 'joi'

export interface Payload {
    to: string | string[],
    from?: string | {
        name?: string,
        email: string
    },
    cc?: string | string[],
    bcc?: string | string[],
    subject: string,
    html?: boolean,
    render: object,
    template: string | {
      wrapper: string,
      content: string
    }
}

export const schema = joi.object().keys({
    to: joi.alternatives(
        joi.string().email().max(255),
        joi.array().items(joi.string().email().max(255)).min(1),
    ).required(),
    from: joi.alternatives(
        joi.string().email().max(255),
        joi.object().keys({
            name: joi.string(),
            email: joi.string().email().max(255).required()
        })
    ).default('do-not-reply@cartus.com'),
    cc: joi.alternatives(
        joi.string().email().max(255),
        joi.array().items(joi.string().email().max(255)).min(1),
    ),
    bcc: joi.alternatives(
        joi.string().email().max(255),
        joi.array().items(joi.string().email().max(255)).min(1),
    ),
    render: joi.object().required(),
    subject: joi.string().max(255).required(),
    html: joi.bool().default(true),
    template: joi.alternatives( //Could be string or object 
      joi.string(),
      joi.object().keys({
        wrapper: joi.string().required(),
        content: joi.string().required()
      })
    ).required()
})

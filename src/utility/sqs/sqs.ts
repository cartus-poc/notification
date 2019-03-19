import { SQS } from "aws-sdk";

export const sendSQSMessage = (sqs: SQS, params: SQS.SendMessageRequest): Promise<SQS.SendMessageResult> => {
    return new Promise((resolve, reject) => {
        sqs.sendMessage(params, (err, data) => {
            if (err) return reject(err)
            return resolve(data)
        })
    }); 
}


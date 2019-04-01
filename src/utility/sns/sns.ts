import { SNS } from "aws-sdk";

export const publishSNSMessage = (sns: SNS, input: SNS.PublishInput): Promise<SNS.PublishResponse> => {
    return new Promise((resolve, reject) => {
        sns.publish(input, (err, data) => {
            if (err) return reject(err)
            return resolve(data)
        })
    }); 
}


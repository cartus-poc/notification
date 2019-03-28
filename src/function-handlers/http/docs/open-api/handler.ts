import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import spec from './open-api-spec.yml'

export const get: APIGatewayProxyHandler = async (_event, _context) => {
    return <APIGatewayProxyResult>{
        statusCode: 200,
        headers: { 'content-type': 'text' },
        body: spec
    }
}
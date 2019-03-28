import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import html from './index.html'

export const get: APIGatewayProxyHandler = async (_event, _context) => {
    return <APIGatewayProxyResult>{
        statusCode: 200,
        headers: { 'content-type': 'text/html' },
        body: html
    }
}
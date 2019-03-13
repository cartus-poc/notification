import { APIGatewayProxyHandler } from 'aws-lambda';
import { Payload, schema } from './payload'
//import * as errors from '../../utility/http/errors'
import * as validation from '../../utility/http/validation'

export const run: APIGatewayProxyHandler = async (event, _context) => {
  const { error, payload } = validation.validateRequestBody<Payload>(event.body, schema);
  if (error) return error;

  //Render the template

  //Stage to a queue
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Got past validation',
      request: payload,
    }),
  };
}


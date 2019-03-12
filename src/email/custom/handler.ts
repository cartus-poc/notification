import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import * as joi from 'joi'
import { Payload, schema } from './payload'
import * as errors from '../../utility/http/errors'

//Start the validation code 
interface Deps {
  errors: typeof errors
  joi: typeof joi
}

export const run: APIGatewayProxyHandler = async (event, _context) => {
  return handleRequest({ errors, joi }, event)
}

export const handleRequest = (deps: Deps, event: APIGatewayProxyEvent): APIGatewayProxyResult => {
  const { errors, joi } = deps;
  if (!event.body) {
    return errors.noBodyResponse
  }
  const { error, value: payload } = joi.validate<Payload>(JSON.parse(event.body), schema, { abortEarly: false });
  if (error) {
    return errors.validationErrorResponse(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }),
  };
}

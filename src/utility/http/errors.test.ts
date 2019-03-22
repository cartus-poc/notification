import assert from 'assert'
import * as errors from './errors'
import sinon from 'sinon'
import joi from 'joi'

describe('errorBody', () => {
    let err;
    beforeEach(() => {
        err = {
            name: 'name',
            details: [
                {
                    field: 'abc',
                    value: 'value',
                    issue: 'bad value',
                    location: 'abc/123'
                }
            ],
            debugId: '',
            message: 'message',
            informationLink: 'link'
        }
    })
    it('should assign 16 random bytes to the "debugId" property if it doesnt yet exist', () => {
        const actual = errors.errorBody(err)
        assert.deepEqual(typeof JSON.parse(actual).debugId, 'string')
        assert.deepEqual(JSON.parse(actual).debugId.length, 32)
    })
    it('should not change the "debugId" property when it already exists', () => {
        err.debugId = 'debugId'
        const actual = errors.errorBody(err)
        assert.deepEqual(typeof JSON.parse(actual).debugId, 'string')
        assert.deepEqual(JSON.parse(actual).debugId, 'debugId')
    })
    it('should return the err object back as a JSON string', () => {
        err.debugId = 'debugId'
        const actual = errors.errorBody(err)
        assert.deepEqual(actual, JSON.stringify(err))
    })
})

describe('errorResponse', () => {
    let err;
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        err = {
            name: 'name',
            details: [
                {
                    field: 'abc',
                    value: 'value',
                    issue: 'bad value',
                    location: 'abc/123'
                }
            ],
            debugId: '',
            message: 'message',
            informationLink: 'link'
        }
        sandbox.stub(errors, 'errorBody')
            .returns('from error body')
    })
    afterEach(() => {
        sandbox.restore()
    })

    it('should return an APIGatewayProxyResult with status code applied from function argument', () => {
        const actual = errors.errorResponse(201, err)
        assert.deepEqual(actual.statusCode, 201)
    })
    it('should return an APIGatewayProxyResult with the body assigned as result of "errorBody" given the error object', () => {
        const actual = errors.errorResponse(201, err)
        assert.deepEqual(actual.body, 'from error body')
    })
})

describe('noBodyResponse', () => {
    const sandbox = sinon.createSandbox();
    let errBodySpy = <sinon.SinonSpy>{};
    beforeEach(() => {
        errBodySpy = sandbox.spy(errors, 'errorBody')
    })
    afterEach(() => {
        sandbox.restore()
    })

    it('should return an APIGatewayProxyResult with 400 as the status code', () => {
        const actual = errors.noBodyResponse();
        assert.deepEqual(actual.statusCode, 400)
    })
    it('should return an APIGatewayProxyResult with hard', () => {
        errors.noBodyResponse();
        assert.deepEqual(errBodySpy.getCall(0).args[0], {
            name: 'NO_BODY_ERR',
            message: 'No request body provided. A valid request body is required.'
        })
    })
})

describe('invalidJSONResponse', () => {
    const sandbox = sinon.createSandbox();
    let errBodySpy = <sinon.SinonSpy>{};
    beforeEach(() => {
        errBodySpy = sandbox.spy(errors, 'errorBody')
    })
    afterEach(() => {
        sandbox.restore()
    })

    it('should return an APIGatewayProxyResult with 400 as the status code', () => {
        const actual = errors.invalidJSONResponse();
        assert.deepEqual(actual.statusCode, 400)
    })
    it('should return an APIGatewayProxyResult with hard coded values for invalid json', () => {
        errors.invalidJSONResponse();
        assert.deepEqual(errBodySpy.getCall(0).args[0], {
            name: 'INVALID_JSON',
            message: 'JSON body is not valid. Please check the format of your JSON request body.'
        })
    })
})

describe('validationErrorResponse', () => {
    const sandbox = sinon.createSandbox();
    let errBodySpy = <sinon.SinonSpy>{};
    beforeEach(() => {
        errBodySpy = sandbox.spy(errors, 'errorBody')
    })
    afterEach(() => {
        sandbox.restore()
    })

    it('should return an APIGatewayProxyResult with 400 as the status code', () => {
        const actual = errors.validationErrorResponse([]);
        assert.deepEqual(actual.statusCode, 400)
    })
    it('should return an APIGatewayProxyResult with hard coded values for validation Errors', () => {
        errors.validationErrorResponse([]);
        assert.deepEqual(errBodySpy.getCall(0).args[0], {
            name: 'VALIDATION_ERR',
            message: 'The request body could not be validated. See details',
            details: []
        })
    })
})

describe('joiValidationErrorResponse', () => {
    let joiErrors = <joi.ValidationError>{}
    const sandbox = sinon.createSandbox();
    let errBodySpy = <sinon.SinonSpy>{};

    beforeEach(() => {
        let errorItem1 = <joi.ValidationErrorItem>{}
        errorItem1.context = <joi.Context>{
            key: 'key1',
            value: 'value1'
        }
        errorItem1.message = 'message1'
        errorItem1.path = ['path', 'item', '1']
        let errorItem2 = <joi.ValidationErrorItem>{}
        errorItem2.context = <joi.Context>{
            key: 'key2',
            value: 'value2'
        }
        errorItem2.message = 'message2'
        errorItem2.path = ['path', 'item', '2']
        joiErrors.details = [
            errorItem1,
            errorItem2
        ]
        errBodySpy = sandbox.spy(errors, 'errorBody')
    })
    afterEach(() => {
        sandbox.restore()
    })
    it('should return an APIGatewayProxyResult with a status code of 400', () => {
        const actual = errors.joiValidationErrorResponse(joiErrors)
        assert.deepEqual(actual.statusCode, 400)
    })
    it('should return the "body" parameter from calling the "errorBody" function with hard coded name and message', () => {
        errors.joiValidationErrorResponse(joiErrors)
        assert.deepEqual(errBodySpy.getCall(0).args[0].name, 'VALIDATION_ERR')
        assert.deepEqual(errBodySpy.getCall(0).args[0].message, 'The request body could not be validated. See details')
    })
    it('should accumulate any details from the joi validation, and map them to ErrorDetails to be returned in the "body" parameter of the response', () => {
        errors.joiValidationErrorResponse(joiErrors)
        const details = <errors.ErrorDetail[]>errBodySpy.getCall(0).args[0].details;
        let i = 1;
        for (let detail of details) {
            assert.deepEqual(detail.field, `key${i}`)
            assert.deepEqual(detail.value, `value${i}`)
            assert.deepEqual(detail.issue, `message${i}`)
            i++;
        }
    })
    it('should map the location field in all mapped ErrorDetail objects as the jois path parameter array joined by "/"', () => {
        errors.joiValidationErrorResponse(joiErrors)
        const details = <errors.ErrorDetail[]>errBodySpy.getCall(0).args[0].details;
        let i = 1;
        for (let detail of details) {
            assert.deepEqual(detail.location, `path/item/${i}`)
            i++;
        }
    })
    it('should pass an empty array when no details are provided in joi.ValidationError input parameter', () => {
        joiErrors.details = []
        errors.joiValidationErrorResponse(joiErrors)
        const details = <errors.ErrorDetail[]>errBodySpy.getCall(0).args[0].details
        assert.deepEqual(details, [])
    })
})
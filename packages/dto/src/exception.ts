import {Exception} from '@canlooks/roost-http'

export class InvalidParameterException extends Exception {
    override statusCode = 400
    override statusMessage = 'Invalid Parameter'
}
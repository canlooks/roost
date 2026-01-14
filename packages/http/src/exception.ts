export class Exception extends Error {
    declare statusCode: number
    declare statusMessage?: string
}
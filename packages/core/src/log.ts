import {ClassType} from '../index'

export const prefix = '> [@canlooks/roost] '

export function log(...message: any[]) {
    message[0] = prefix + message[0]
    console.log(...message)
}

export class InternalError extends Error {
    constructor(message: string, options: {
        component: ClassType
        property: PropertyKey
    }) {
        log(message)
        super(prefix + `This error occurred in "${options.component.name}.${options.property.toString()}"`)
    }
}
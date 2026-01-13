import {Fn} from '../index'
import {isPromise} from './utility'

export function methodWrapper<F extends Fn>(fn: F, target: Function, p: PropertyKey): F {
    return {
        [fn.name]: function (...args: any[]) {
            try {
                const ret = fn.apply(this, args)
                if (isPromise(ret)) {
                    return Promise.resolve(ret).catch(e => {
                        printError(target, p)
                        throw e
                    })
                }
                return ret
            } catch (e) {
                printError(target, p)
                throw e
            }
        }
    }[fn.name] as F
}

const isDev = process.env.NODE_ENV === 'development'
const debug = process.env.DEBUG?.toLowerCase() === 'true' || process.env.DEBUG?.toLowerCase() === 'on'

export const logPrefix = '[@canlooks/roost] '
const unknownName = '[unknown]'

function printError(target: Function, p: PropertyKey) {
    if (isDev || debug) {
        const targetName = target?.name || target?.constructor?.name || unknownName
        const propertyName = p?.toString() || unknownName
        console.error(`${logPrefix}This error occurred in "${targetName}.${propertyName}"`)
    }
}
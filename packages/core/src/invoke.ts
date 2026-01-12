import {Obj} from '../index'
import {flattedObjectRoutes, flattedStringRoutes} from './route'
import {match} from 'path-to-regexp'
import {matchObject} from './utility'
import {Container} from './container'
import {getInsertParamsIndex} from './params'
import {getInsertQueryIndex} from './query'

export function invoke<T = any>(path: string, ...args: any): T
export function invoke<T = any>(pattern: Obj, ...args: any): T
export function invoke(pattern: string | Obj, ...args: any) {
    if (typeof pattern === 'string') {
        const [path, searchParams] = pattern.split('?')
        for (const [routePath, {component, propertyKey}] of flattedStringRoutes) {
            const matchResult = match(routePath)(path)
            if (matchResult) {
                const instance = Container.get(component)

                const insertParamsIndex = getInsertParamsIndex(component, propertyKey)
                if (insertParamsIndex !== null) {
                    args[insertParamsIndex] = matchResult.params
                }

                const insertQueryIndex = getInsertQueryIndex(component, propertyKey)
                if (insertQueryIndex !== null) {
                    args[insertQueryIndex] = new URLSearchParams(searchParams)
                }

                return instance[propertyKey].apply(instance, args)
            }
        }
    } else {
        for (const [routeObject, {component, propertyKey}] of flattedObjectRoutes) {
            if (matchObject(routeObject, pattern)) {
                const instance = Container.get(component)
                return instance[propertyKey].call(instance, pattern, ...args)
            }
        }
    }
}
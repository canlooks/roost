import {Container, Obj} from '../index'
import {flattedObjectRoutes, flattedStringRoutes} from './route'
import {match} from 'path-to-regexp'
import {matchObject} from './utility'
import {getInsertParamsIndex} from './params'
import {getInsertQueryIndex} from './query'

export function defineInvoke(container: Container) {
    return invoke

    function invoke<T = any>(path: string, ...args: any): T
    function invoke<T = any>(pattern: Obj, ...args: any): T
    function invoke(pattern: string | Obj, ...args: any) {
        if (typeof pattern === 'string') {
            const [path, searchParams] = pattern.split('?')
            for (const [routePath, {component, propertyKey}] of flattedStringRoutes) {
                const matchResult = match(routePath)(path)
                if (matchResult) {
                    const instance = container.get(component)

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
            throw Error(`path "${pattern}" not found`)
        }

        for (const [routeObject, {component, propertyKey}] of flattedObjectRoutes) {
            if (matchObject(routeObject, pattern)) {
                const instance = container.get(component)
                return instance[propertyKey].call(instance, pattern, ...args)
            }
        }
        throw Error(`No Matching pattern of "${JSON.stringify(pattern)}" found.`)
    }
}
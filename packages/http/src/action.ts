import {Action, ClassType, getMapValue} from '@canlooks/roost'

type Method =
    | 'get'
    | 'delete'
    | 'head'
    | 'options'
    | 'post'
    | 'put'
    | 'patch'
    | 'purge'
    | 'link'
    | 'unlink'

export function GET(path: string) {
    return defineActionDecorator('get', path)
}

export const component_propertyKey_method = new WeakMap<ClassType, Map<PropertyKey, Method>>()

export function defineActionDecorator(method: Method, path: string) {
    return (prototype: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        const propertyKey_method = getMapValue(component_propertyKey_method, prototype.constructor, () => new Map())
        propertyKey_method.set(propertyKey, method)

        return Action(path)(prototype, propertyKey, descriptor)
    }
}
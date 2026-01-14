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

export function Get(path: string) {
    return defineActionDecorator('get', path)
}

export function Delete(path: string) {
    return defineActionDecorator('delete', path)
}

export function Head(path: string) {
    return defineActionDecorator('head', path)
}

export function Options(path: string) {
    return defineActionDecorator('options', path)
}

export function Post(path: string) {
    return defineActionDecorator('post', path)
}

export function Put(path: string) {
    return defineActionDecorator('put', path)
}

export function Patch(path: string) {
    return defineActionDecorator('patch', path)
}

export function Purge(path: string) {
    return defineActionDecorator('purge', path)
}

export function Link(path: string) {
    return defineActionDecorator('link', path)
}

export function Unlink(path: string) {
    return defineActionDecorator('unlink', path)
}

export const component_propertyKey_method = new WeakMap<ClassType, Map<PropertyKey, Method>>()

function defineActionDecorator(method: Method, path: string) {
    return (prototype: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        const propertyKey_method = getMapValue(component_propertyKey_method, prototype.constructor, () => new Map())
        propertyKey_method.set(propertyKey, method)

        return Action(path)(prototype, propertyKey, descriptor)
    }
}
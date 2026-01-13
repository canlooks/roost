import {ClassType} from '../index'
import {getMapValue} from './utility'

const component_propertyKey_index = new WeakMap<ClassType, Map<PropertyKey, number>>()

export function Query(target: Object, propertyKey: PropertyKey, parameterIndex: number): void
export function Query(): ParameterDecorator
export function Query(a?: any, b?: any, c?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey, parameterIndex: number) => {
        const propertyKey_index = getMapValue(component_propertyKey_index, prototype.constructor, () => new Map())
        propertyKey_index.set(propertyKey, parameterIndex)
    }
    return a ? fn(a, b, c) : fn
}

export function getInsertQueryIndex(component: ClassType, propertyKey: PropertyKey) {
    const propertyKey_index = component_propertyKey_index.get(component)
    if (propertyKey_index) {
        const index = propertyKey_index.get(propertyKey)
        return index ?? null
    }
    return null
}
import {ClassType, getMapValue} from '@canlooks/roost'

const component_propertyKey_index = new WeakMap<ClassType, Map<PropertyKey, number>>()

export function Res(target: Object, propertyKey: PropertyKey, parameterIndex: number): void
export function Res(): ParameterDecorator
export function Res(a?: any, b?: any, c?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey, parameterIndex: number) => {
        const propertyKey_index = getMapValue(component_propertyKey_index, prototype.constructor, () => new Map())
        propertyKey_index.set(propertyKey, parameterIndex)
    }
    a ? fn(a, b, c) : fn
}

export function getInsertResIndex(component: ClassType, propertyKey: PropertyKey) {
    const index = component_propertyKey_index.get(component)?.get(propertyKey)
    return index ?? null
}
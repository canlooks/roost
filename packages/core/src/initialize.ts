import {getMapValue, registerDecorator} from './utility'
import {ClassType} from '../index'
import {methodWrapper} from './debugHelper'

const component_pendingInitializers = new Map<ClassType, any[]>
const instance_pendingInitializers = new WeakMap<object, any[]>

export function Initializer(target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor): void
export function Initializer(): MethodDecorator
export function Initializer(a?: any, b?: any, c?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        const component = prototype.constructor as ClassType
        registerDecorator(component, instance => {
            const returnValue = instance[propertyKey]()
            getMapValue(component_pendingInitializers, component, () => []).push(returnValue)
            getMapValue(instance_pendingInitializers, instance, () => []).push(returnValue)
        }, 2)

        descriptor.value = methodWrapper(descriptor.value, component, propertyKey)
    }
    return c ? fn(a, b, c) : fn
}

export const Init = Initializer

export function Pending(target: Object, propertyKey: PropertyKey): void
export function Pending(): PropertyDecorator
export function Pending(a?: any, b?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey) => {
        registerDecorator(prototype.constructor as ClassType, async instance => {
            const pendingInitializers = instance_pendingInitializers.get(instance)
            instance[propertyKey] = pendingInitializers
                ? Promise.all([...pendingInitializers])
                : Promise.resolve()
        }, 3)
    }
    return a ? fn(a, b) : fn
}

export function Ready(target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor): void
export function Ready(): MethodDecorator
export function Ready(a?: any, b?: any, c?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        registerDecorator(prototype.constructor as ClassType, async instance => {
            const pendingInitializers = instance_pendingInitializers.get(instance)
            if (!pendingInitializers) {
                instance[propertyKey]()
                return
            }
            const res = await Promise.all([...pendingInitializers])
            instance[propertyKey](res.length === 1 ? res[0] : res)
        }, 3)
    }
    return c ? fn(a, b, c) : fn
}

export function allReady() {
    const promises = []
    for (const [, pendingInitializers] of component_pendingInitializers) {
        promises.push(...pendingInitializers)
    }
    component_pendingInitializers.clear()
    return Promise.all(promises)
}
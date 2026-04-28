import {getMapValue} from './util'
import {ClassType} from '../index'

const component_initializes = new WeakMap<object, Set<PropertyKey>>()

export function Initialize(target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor): void
export function Initialize(): MethodDecorator
export function Initialize(a?: any, b?: any, c?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        const initializes = getMapValue(component_initializes, prototype.constructor, () => new Set())
        initializes.add(propertyKey)
    }
    return c ? fn(a, b, c) : fn
}

export const Init = Initialize

export async function implementInitialize<T>(component: ClassType<T>, instance: T) {
    const initializes = component_initializes.get(component)
    if (initializes) {
        const promises: Promise<void>[] = []
        for (const property of initializes) {
            const initializer = instance[property as keyof T]
            if (typeof initializer === 'function') {
                promises.push(initializer.call(instance))
            }
        }
        await Promise.all(promises)
    }
}
import {ClassType, RecurseConstruct} from '../index'

type Register = <T>(component: ClassType<T>) => Promise<T>

export async function registerComponents<C extends any[]>(components: [...C], register: Register): Promise<RecurseConstruct<C>>
export async function registerComponents<C>(components: C, register: Register): Promise<RecurseConstruct<C>>
export async function registerComponents(components: any, register: Register) {
    if (typeof components === 'function') {
        return await register(components)
    }

    if (Array.isArray(components)) {
        return await Promise.all(
            components.map(comp => registerComponents(comp, register))
        )
    }

    if (typeof components === 'object' && components) {
        const promises: Promise<void>[] = []
        const instances: any = {}
        for (const k in components) {
            promises.push(
                registerComponents(components[k], register).then(instance => {
                    instances[k] = instance
                })
            )
        }
        await Promise.all(promises)
        return instances
    }

    return components
}

export function getMapValue<K, V>(data: Map<K, V>, key: K): V | undefined
export function getMapValue<K, V>(data: Map<K, V>, key: K, defaultValue: () => V): V
export function getMapValue<K extends object, V>(data: WeakMap<K, V>, key: K): V | undefined
export function getMapValue<K extends object, V>(data: WeakMap<K, V>, key: K, defaultValue: () => V): V
export function getMapValue(data: any, key: any, defaultValue?: () => any) {
    if (data.has(key)) {
        return data.get(key)
    }
    if (defaultValue) {
        const value = defaultValue()
        data.set(key, value)
        return value
    }
}

export function isClass(fn: Function | ClassType): fn is ClassType {
    if (fn.prototype?.constructor !== fn) {
        return false
    }
    return Function.prototype.toString.call(fn).startsWith('class')
}

export function isPromise<T>(it: any): it is Promise<T> {
    if (!it) {
        return false
    }
    return it instanceof Promise || (
        typeof it.then === 'function'
        && typeof it.catch === 'function'
        && typeof it.finally === 'function'
    )
}
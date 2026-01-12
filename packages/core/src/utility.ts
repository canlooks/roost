import {Component, Obj, RecurseConstruct} from '../index'

export function registerComponents<T extends any[]>(components: [...T], register: <C extends Component>(component: C) => InstanceType<C>): RecurseConstruct<T>
export function registerComponents<T>(components: T, register: <C extends Component>(component: C) => InstanceType<C>): RecurseConstruct<T>
export function registerComponents(components: any, register: <C extends Component>(component: C) => InstanceType<C>) {
    if (typeof components === 'function') {
        return register(components)
    }

    if (Array.isArray(components)) {
        return components.map(comp => registerComponents(comp, register))
    }

    if (typeof components === 'object' && components) {
        const instances: any = {}
        for (const k in components) {
            instances[k] = registerComponents(components[k], register)
        }
        return instances
    }

    return components
}

const component_sequence_callbacks = new WeakMap<Component, Set<(instance: any) => void>[]>()

export function registerDecorator<C extends Component>(component: C, callback: (instance: InstanceType<C>) => void, sequence = 0) {
    const sequence_callbacks = getMapValue(component_sequence_callbacks, component, () => [])
    const callbacks = getArrayItem(sequence_callbacks, sequence, () => new Set())

    callbacks.add(callback)
}

export function implementDecorator<C extends Component>(component: C, instance: InstanceType<C>) {
    const sequence_callbacks = component_sequence_callbacks.get(component)
    if (!sequence_callbacks) {
        return
    }
    sequence_callbacks.forEach(callbacks => {
        for (const callback of callbacks) {
            callback(instance)
        }
    })
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

function getArrayItem<T>(arr: T[], index: number): T | undefined
function getArrayItem<T>(arr: T[], index: number, defaultValue: () => T): T
function getArrayItem(arr: any[], index: number, defaultValue?: () => any) {
    if (index in arr) {
        return arr[index]
    }
    if (defaultValue) {
        const value = defaultValue()
        arr[index] = value
        return value
    }
}

export function joinPath(path1: string, path2: string, separateWithSlash: boolean) {
    path1 = dropBothSidesSlash(path1)
    path2 = dropBothSidesSlash(path2)

    if (!path1) {
        return path2
    }
    if (!path2) {
        return path1
    }

    return separateWithSlash ? `${path1}/${path2}` : path1 + path2

    function dropBothSidesSlash(path: string) {
        return path.replace(/^\/+/, '').replace(/\/+$/, '')
    }
}

export function assignObject(obj1: Obj, obj2?: Obj) {
    const assigned = {...obj1}
    if (obj2) {
        for (const k in obj2) {
            const value = obj2[k]
            if (k in assigned && assigned[k] !== value) {
                throw Error(`Object-pattern value of key "${k}" is conflicting`)
            }
            assigned[k] = value
        }
    }
    return assigned
}

export function matchObject(routeObject: Obj, invokeObject: Obj) {
    for (const k in routeObject) {
        if (invokeObject[k] !== routeObject[k]) {
            return false
        }
    }
    return true
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
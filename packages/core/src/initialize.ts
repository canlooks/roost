const prototype_initializers = new WeakMap<Object, Set<string>>()

export function Initialize(target: Object, property: string, descriptor: PropertyDescriptor): void
export function Initialize(): MethodDecorator
export function Initialize(a?: any, b?: any, c?: any) {
    const fn = (prototype: Object, property: string, descriptor: PropertyDescriptor) => {
        const initializers = prototype_initializers.get(prototype) || new Set<string>()
        initializers.add(property)
        prototype_initializers.set(prototype, initializers)
    }
    return c ? fn(a, b, c) : fn
}

export async function implementInitializeDecorator(instance: any) {
    const prototype = Object.getPrototypeOf(instance)
    const initializers = prototype_initializers.get(prototype)
    if (!initializers) {
        return
    }
    const promises: Promise<void>[] = []
    for (const initializer of initializers) {
        promises.push(instance[initializer]())
    }
    await Promise.all(promises)
}
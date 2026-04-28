declare namespace Roost {
    /**
     * -------------------------------------------------------------------------------------
     * Internal types
     */

    type ClassType<I = any, A = any> = new (...args: A[]) => I

    type Fn<R = any, A = any, T = any> = (this: T, ...args: A[]) => R

    type Obj<V = any, K extends string = string> = Record<K, V>

    type RecurseConstruct<T> = T extends ClassType<infer R> ? R
        : T extends Map<infer K, infer R> ? Map<K, RecurseConstruct<R>>
            : T extends Set<infer R> ? Set<RecurseConstruct<R>>
                : T extends Record<any, any> | any[] ? { [K in keyof T]: RecurseConstruct<T[K]> }
                    : T

    /**
     * -------------------------------------------------------------------------------------
     * Lazy
     */

    type LazyLoader = () => Promise<{ default: any }>

    export function lazy<T extends LazyLoader>(load: T): T

    /**
     * -------------------------------------------------------------------------------------
     * App
     */

    class Roost {

        static create<T extends any[]>(components: [...T]): Promise<Roost>
        static create<T>(components: T): Promise<Roost>

        static create<T>(component: ClassType<T>, config?: Record<keyof T, T[keyof T]>): Promise<Roost>
        static create<T>(name: string, component: ClassType<T>, config?: Record<keyof T, T[keyof T]>): Promise<Roost>

        static create(lazyLoader: LazyLoader): Promise<Roost>
        static create(name: string, lazyLoader: LazyLoader): Promise<Roost>

        container: Container

        registerComponent<T>(name: ContainerKey<T>, component: ClassType<T> | LazyLoader, config?: Record<keyof T, T[keyof T]>): Promise<T>
    }

    /**
     * -------------------------------------------------------------------------------------
     * Container
     */

    type ContainerKey<T = any> = string | ClassType<T> | LazyLoader

    type ContainedItem<T = any> = {
        name?: string
        component?: ClassType<T>
        instance?: T
        loader?: LazyLoader
    }

    class Container {
        get<T>(name: string): ContainedItem<T> | undefined
        get<T>(component: ClassType<T>): ContainedItem<T> | undefined
        get<T>(loader: LazyLoader): ContainedItem<T> | undefined

        set<T>(name: string, item: ContainedItem<T>): void
        set<T>(component: ClassType<T>, item: ContainedItem<T>): void
        set<T>(loader: LazyLoader, item: ContainedItem<T>): void
    }
}

export = Roost
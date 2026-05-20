import {ComponentType} from '../index'

export class Container {
    map = new Map<string | ComponentType, Promise<any>>()

    get<T = any>(name: string): Promise<T>
    get<T>(component: ComponentType<T>): Promise<T>
    get(key: string | ComponentType) {
        return this.map.get(key)
    }

    set(name: string, pendingInstance: Promise<any>): void
    set<T>(component: ComponentType<T>, pendingInstance: Promise<T>): void
    set(key: string | ComponentType, pendingInstance: Promise<any>) {
        this.map.set(key, pendingInstance)
    }
}
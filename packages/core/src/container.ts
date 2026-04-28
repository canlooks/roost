import {ClassType, ContainedItem, ContainerKey, LazyLoader} from '../index'

export class Container {
    map = new Map<string | ClassType | LazyLoader, ContainedItem>()

    get<T>(key: ContainerKey<T>): ContainedItem<T> | undefined {
        return this.map.get(key)
    }

    set<T>(key: ContainerKey<T>, value: ContainedItem<T>) {
        this.map.set(key, value)
    }
}
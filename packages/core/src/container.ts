import {ClassType} from '../index'
import {implementDecorator} from './utility'
import {defineInvoke} from './invoke'

export class Container {
    constructor() {
    }

    private map = new Map<ClassType, object>()

    get<C extends ClassType>(component: C): InstanceType<C> {
        const instance = this.map.get(component) as InstanceType<C> | undefined
        return instance || this.createInstance(component)
    }

    private createInstance<C extends ClassType>(component: C): InstanceType<C> {
        const newInstance = new component(this, defineInvoke(this))
        this.map.set(component, newInstance)
        implementDecorator(component, newInstance, this)
        return newInstance
    }
}
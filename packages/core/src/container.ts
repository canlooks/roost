import {ClassType} from '../index'
import {implementDecorator} from './utility'
import {defineInvoke} from './invoke'

export class Container {
    private map = new Map<ClassType, object>()

    get<C extends ClassType>(component: C): InstanceType<C> {
        const instance = this.map.get(component) as InstanceType<C> | undefined
        return instance || this.createInstance(component)
    }

    private createInstance<C extends ClassType>(component: C): InstanceType<C> {
        const instance = new component()
        instance.container = this
        instance.invoke = defineInvoke(this)
        this.map.set(component, instance)
        implementDecorator(component, instance, this)
        return instance
    }

    set<C extends ClassType>(component: C, instance: InstanceType<C>) {
        this.map.set(component, instance)
    }
}
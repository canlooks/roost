import {Component} from '../index'
import {implementDecorator} from './utility'

export class Container {
    private static map = new Map<Component, object>()

    static get<C extends Component>(component: C): InstanceType<C> {
        const instance = this.map.get(component) as InstanceType<C> | undefined
        if (instance) {
            return instance
        }
        const newInstance = new component()
        this.map.set(component, newInstance)
        implementDecorator(component, newInstance)
        return newInstance
    }
}
import {ComponentType} from '../index'
import {Roost} from './app'
import {implementModuleDecorator} from './module'
import {implementInjectDecorator} from './inject'
import {implementInitializeDecorator} from './initialize'
import {implementControllerDecorator} from './controller'

export class Utility {
    constructor(private app: Roost) {
    }

    async registerModule(component: ComponentType): Promise<void>
    async registerModule(components: any[]): Promise<void>
    async registerModule(components: Record<any, any>): Promise<void>
    async registerModule(a: any) {
        const promises: Promise<void>[] = []
        const recurse = (module: any, name?: string) => {
            if (typeof module === 'function') {
                promises.push(
                    typeof name !== 'undefined'
                        ? this.registerComponent(name, module)
                        : this.registerComponent(module)
                )
            } else if (Array.isArray(module)) {
                module.forEach(component => recurse(component))
            } else {
                for (const name in module) {
                    recurse(module[name], name)
                }
            }
        }
        recurse(a)
        await Promise.all(promises)
    }

    registerComponent<T>(component: ComponentType<T>): Promise<T>
    registerComponent<T>(name: string, component: ComponentType<T>): Promise<T>
    registerComponent(a: any, b?: any) {
        const name = typeof a === 'string' ? a : void 0
        const Component = b || a
        let pendingInstance = this.app.container.get(name ?? Component)
        if (!pendingInstance) {
            pendingInstance = new Promise(async resolve => {
                const instance = new Component()
                implementControllerDecorator(this.app, instance)
                await Promise.all([
                    implementModuleDecorator(this.app, Component),
                    implementInjectDecorator(this.app, instance)
                ])
                await implementInitializeDecorator(instance)
                resolve(instance)
            })
            this.app.container.set(name ?? Component, pendingInstance)
        }
        return pendingInstance
    }
}
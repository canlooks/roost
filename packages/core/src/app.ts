import {ClassType, ContainerKey, LazyLoader} from '../index'
import {Container} from './container'
import {isClass, registerComponents} from './util'
import {implementInitialize} from './initialize'
import {implementInject} from './inject'

export class Roost {
    static async create<T extends any[]>(components: [...T]): Promise<Roost>
    static async create<T>(components: T): Promise<Roost>

    static async create<T>(component: ClassType<T>, config?: Record<keyof T, T[keyof T]>): Promise<Roost>
    static async create<T>(name: string, component: ClassType<T>, config?: Record<keyof T, T[keyof T]>): Promise<Roost>

    static async create(lazyLoader: LazyLoader): Promise<Roost>
    static async create(name: string, lazyLoader: LazyLoader): Promise<Roost>

    static async create(a: any, b?: any, c?: any) {
        const app = new Roost()
        if (typeof a === 'object') {
            await registerComponents(a, component => app.registerComponent(component, component))
        } else {
            const name = typeof a === 'string' ? a : b
            const component = typeof a === 'string' ? b : a
            const config = c || (typeof b === 'object' ? b : void 0)

            await app.registerComponent(name, component, config)
        }

        return app
    }

    container = new Container()

    async registerComponent<T>(name: ContainerKey<T>, component: ClassType<T> | LazyLoader, config?: Record<keyof T, T[keyof T]>) {
        let item = this.container.get<any>(name)
        if (!item?.instance) {
            item ||= {}
            if (typeof name === 'string') {
                item.name = name
            }
            if (isClass(component)) {
                item.component = component
                item.instance = new component()
                this.container.set(name, item)
                // Set config
                if (config) {
                    for (const k in config) {
                        item.instance[k] = config[k]
                    }
                }
                // Inject
                await implementInject(component, item.instance, this)
                // Initialize
                await implementInitialize(component, item.instance)
            } else {
                item.loader = component
                this.container.set(name, item)
            }
        }

        return item.instance
    }
}
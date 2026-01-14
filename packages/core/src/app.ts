import {ClassType, PluginHooks, RecurseConstruct} from '../index'
import {Container} from './container'
import {flattedStringRoutes, makeRoutesFlat} from './route'
import {registerComponents, registerDecorator} from './utility'
import {allReady} from './async'
import {defineInvoke} from './invoke'
import {logPrefix} from './debugHelper'
import {Component} from './component'

export class Roost<T = any> extends Component {
    private static created = false

    private static usingPlugins = new Set<PluginHooks>()

    static use(plugins: PluginHooks[]): typeof Roost
    static use(plugin: PluginHooks): typeof Roost
    static use(p: any) {
        if (this.created) {
            throw Error(logPrefix + '"Roost.use()" must be executed before "Roost.create()"')
        }

        const pluginHooks = Array.isArray(p) ? p : [p]
        pluginHooks.forEach(hook => {
            this.usingPlugins.add(hook)
        })

        return this
    }

    static create<T extends any[]>(modules: [...T], onLoad?: (instances: RecurseConstruct<T>) => void): Roost
    static create<T>(modules: T, onLoad?: (instances: RecurseConstruct<T>) => void): Roost
    static create(modules: any, onLoad?: (instances: any) => void) {
        if (this.created) {
            throw Error(logPrefix + 'Roost app is already created.')
        }
        this.created = true
        return new this(modules, onLoad)
    }

    constructor(modules: T, onLoad?: (instances: RecurseConstruct<T>) => void) {
        super()
        appInstance = this
        this.container = new Container()
        this.invoke = defineInvoke(this.container)
        const instances = registerComponents(modules, comp => this.container.get(comp))
        makeRoutesFlat()
        allReady().then(() => {
            onLoad?.(instances)
            this.triggerHook('onCreated', this)
        })
    }

    routeMap = flattedStringRoutes

    private triggerHook<T extends keyof PluginHooks>(name: T, ...args: Parameters<Required<PluginHooks>[T]>) {
        for (const pluginHooks of Roost.usingPlugins) {
            pluginHooks[name]?.(...args as [any])
        }
    }
}

let appInstance: Roost

export function App(target: Object, propertyKey: PropertyKey): void
export function App(): PropertyDecorator
export function App(a?: any, b?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey) => {
        registerDecorator(prototype.constructor as ClassType, (instance) => {
            instance[propertyKey] = appInstance
        })
    }
    return a ? fn(a, b) : fn
}
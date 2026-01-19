import {ClassType, PluginDefinition, PluginHooks, RecurseConstruct} from '../index'
import {Container} from './container'
import {registerComponents, registerDecorator} from './utility'
import {allReady, globalPendingArr} from './async'
import {defineInvoke} from './invoke'
import {logPrefix} from './debugHelper'
import {Component} from './component'
import {objectRoutes, stringRoutes} from './route'

export class Roost<T = any> extends Component {
    private static created = false

    private static usingPlugins = new Set<PluginDefinition>()

    static use(plugins: PluginDefinition[]): typeof Roost
    static use(plugin: PluginDefinition): typeof Roost
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

    routeMap = stringRoutes
    patternMap = objectRoutes

    constructor(modules: T, onLoad?: (instances: RecurseConstruct<T>) => void) {
        super()
        appInstance = this
        this.container = new Container(this)
        this.invoke = defineInvoke(this.container)

        const instances = registerComponents(modules, comp => this.container.get(comp))

        const pendingArr = this.triggerHook('onCreate', this)
        globalPendingArr.push(...pendingArr)

        allReady().then(() => {
            onLoad?.(instances)
        })
    }

    private triggerHook<T extends keyof PluginHooks>(name: T, ...args: Parameters<Required<PluginHooks>[T]>) {
        const pendingArr = []
        for (const pluginHooks of Roost.usingPlugins) {
            const hook = pluginHooks[name]
            if (typeof hook === 'function') {
                pendingArr.push(hook(...args as [any]))
            }
        }
        return pendingArr
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
    a ? fn(a, b) : fn
}
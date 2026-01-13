import {PluginFunction, PluginHooks, RecurseConstruct} from '../index'
import {Container} from './container'
import {makeRoutesFlat} from './route'
import {registerComponents} from './utility'
import {allReady} from './initialize'
import {defineInvoke} from './invoke'
import {logPrefix} from './debugHelper'
import {Component} from './component'

export class Roost<T = any> extends Component {
    private static created = false

    private static usingPlugins = new Set<PluginHooks>()

    static use<O>(plugin: PluginFunction<O>, options?: O): typeof Roost
    static use(plugins: PluginHooks[]): typeof Roost
    static use(plugin: PluginHooks): typeof Roost
    static use(p: any, options?: any) {
        if (this.created) {
            throw Error(logPrefix + '"Roost.use()" must be executed before "Roost.create()"')
        }

        if (typeof p === 'function') {
            this.usingPlugins.add(p(options))
        } else {
            const pluginHooks = Array.isArray(p) ? p : [p]
            pluginHooks.forEach(hook => {
                this.usingPlugins.add(hook)
            })
        }

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
        const container = new Container()
        super(container, defineInvoke(container))
        const instances = registerComponents(modules, comp => container.get(comp))
        makeRoutesFlat()
        allReady().then(() => {
            onLoad?.(instances)
            this.triggerHook('onCreated', this)
        })
    }

    private triggerHook<T extends keyof PluginHooks>(name: T, ...args: Parameters<Required<PluginHooks>[T]>) {
        for (const pluginHooks of Roost.usingPlugins) {
            pluginHooks[name]?.(...args as [any])
        }
    }
}
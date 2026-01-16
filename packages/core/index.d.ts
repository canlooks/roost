declare namespace Roost {
    /**
     * -------------------------------------------------------------------------------------
     * App
     */

    class Roost<T = any> extends Component {
        static use(plugins: PluginHooks[]): typeof Roost
        static use(plugin: PluginHooks): typeof Roost

        static create<T extends any[]>(modules: [...T], onLoad?: (instances: RecurseConstruct<T>) => void): Roost
        static create<T>(modules: T, onLoad?: (instances: RecurseConstruct<T>) => void): Roost

        constructor(modules: T, onLoad?: (instances: RecurseConstruct<T>) => void)

        routeMap: Map<string, StringRouteAction>
        patternMap: Map<Obj, ObjectRouteAction>
    }

    const App: PropertyDecorator & (() => PropertyDecorator)

    /**
     * -------------------------------------------------------------------------------------
     * Module
     */

    function Module(modules: any): ClassDecorator

    /**
     * -------------------------------------------------------------------------------------
     * Container
     */

    class Container {
        get<C extends ClassType>(component: C): InstanceType<C>
        set<C extends ClassType>(component: C, instance: InstanceType<C>): void
    }

    /**
     * -------------------------------------------------------------------------------------
     * Component
     */

    class Component {
        container: Container
        invoke: InvokeFunction
    }

    /**
     * -------------------------------------------------------------------------------------
     * Initializer
     */

    const Initializer: MethodDecorator & (() => MethodDecorator)
    /**
     * @alias {@link Initializer}
     */
    const Init: typeof Initializer

    /**
     * Inject a promise to a property, witch resolve on component ready
     */
    const Pending: PropertyDecorator & (() => PropertyDecorator)

    /**
     * Let function execute on component ready.
     */
    const Ready: MethodDecorator & (() => MethodDecorator)

    /**
     * -------------------------------------------------------------------------------------
     * Inject
     */

    function Inject(component: ClassType): PropertyDecorator
    function Inject(component: () => Promise<{ default: ClassType }>): PropertyDecorator

    /**
     * -------------------------------------------------------------------------------------
     * Controller
     */

    function Controller(path: string): ClassDecorator
    function Controller(pattern: Obj): ClassDecorator

    function eachControllerPatterns(controller: ClassType, callback: (pattern: string | Obj | undefined) => any): void

    /**
     * -------------------------------------------------------------------------------------
     * Action
     */

    function Action(path: string): MethodDecorator
    function Action(pattern: Obj): MethodDecorator

    /**
     * -------------------------------------------------------------------------------------
     * Invoke
     */

    type InvokeFunction = {
        <T = any>(path: string, ...args: any): T
        <T = any>(pattern: Obj, ...args: any): T
    }

    /**
     * -------------------------------------------------------------------------------------
     * Params
     */

    const Params: ParameterDecorator & (() => ParameterDecorator)

    function getInsertParamsIndex(component: ClassType, propertyKey: PropertyKey): number | null

    /**
     * -------------------------------------------------------------------------------------
     * Query
     */

    const Query: ParameterDecorator & (() => ParameterDecorator)

    function getInsertQueryIndex(component: ClassType, propertyKey: PropertyKey): number | null

    /**
     * -------------------------------------------------------------------------------------
     * Plugin
     */

    type PluginHooks = {
        onCreated?: (app: Roost) => void
    }

    interface PluginDefinition extends PluginHooks {
        name: string | symbol
    }

    /**
     * -------------------------------------------------------------------------------------
     * Internal types
     */

    type ClassType<I = any, A = any> = new (...args: A[]) => I
    type Fn<R = any, A = any, T = any> = (this: T, ...args: A[]) => R
    type Obj<V = any, K extends string = string> = Record<K, V>

    type RecurseConstruct<T> = T extends ClassType<infer R> ? R
        : T extends Map<infer K, infer R> ? Map<K, RecurseConstruct<R>>
            : T extends Set<infer R> ? Set<RecurseConstruct<R>>
                : T extends Record<any, any> | any[] ? { [K in keyof T]: RecurseConstruct<T[K]> }
                    : T

    type ActionItem = {
        component: ClassType
        propertyKey: PropertyKey
    }

    interface StringRouteAction extends ActionItem {
        path?: string
    }

    interface ObjectRouteAction extends ActionItem {
        pattern: Obj
    }

    /**
     * -------------------------------------------------------------------------------------
     * Utility
     */

    function registerComponents<T extends any[]>(components: [...T], register: <C extends ClassType>(component: C) => InstanceType<C>): RecurseConstruct<T>
    function registerComponents<T>(components: T, register: <C extends ClassType>(component: C) => InstanceType<C>): RecurseConstruct<T>

    function registerDecorator<C extends ClassType>(component: C, callback: (instance: InstanceType<C>, app: Roost) => void, sequence?: number): void

    function implementDecorator<C extends ClassType>(component: C, instance: InstanceType<C>, app: Roost): void

    function getMapValue<K, V>(data: Map<K, V>, key: K): V | undefined
    function getMapValue<K, V>(data: Map<K, V>, key: K, defaultValue: () => V): V
    function getMapValue<K extends object, V>(data: WeakMap<K, V>, key: K): V | undefined
    function getMapValue<K extends object, V>(data: WeakMap<K, V>, key: K, defaultValue: () => V): V

    function joinPath(path1?: string, path2?: string, separateWithSlash?: boolean): string

    function assignObject(obj1: Obj, obj2?: Obj): Obj

    function matchObject(routeObject: Obj, invokeObject: Obj): boolean

    function isPromise<T>(it: any): it is Promise<T>

    function isClass(fn: Function | ClassType): fn is ClassType

    const logPrefix: string

    function methodWrapper<F extends Fn>(fn: F, target: Function, p: PropertyKey): F

    function printError(target: Function, p: PropertyKey): void
}

export = Roost
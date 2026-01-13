declare namespace Roost {
    /**
     * -------------------------------------------------------------------------------------
     * App
     */

    class Roost<T = any> extends Component {
        static use<O>(plugin: PluginFunction<O>, options?: O): typeof Roost
        static use(plugins: PluginHooks[]): typeof Roost
        static use(plugin: PluginHooks): typeof Roost

        static create<T extends any[]>(modules: [...T], onLoad?: (instances: RecurseConstruct<T>) => void): Roost
        static create<T>(modules: T, onLoad?: (instances: RecurseConstruct<T>) => void): Roost

        constructor(modules: T, onLoad?: (instances: RecurseConstruct<T>) => void)
    }

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

    const Ready: MethodDecorator & (() => MethodDecorator)

    /**
     * -------------------------------------------------------------------------------------
     * Inject
     */

    function Inject(component: ClassType): PropertyDecorator

    /**
     * -------------------------------------------------------------------------------------
     * Controller
     */

    function Controller(path: string): ClassDecorator
    function Controller(pattern: Obj): ClassDecorator

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

    /**
     * -------------------------------------------------------------------------------------
     * Query
     */

    const Query: ParameterDecorator & (() => ParameterDecorator)

    /**
     * -------------------------------------------------------------------------------------
     * Plugin
     */

    type PluginHooks = {
        onCreated?: (app: Roost) => void
    }

    type PluginFunction<O = any> = (options: O) => PluginHooks

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

    type StringRouteItem = {
        path: string
        children?: Set<StringRouteItem | StringRouteAction>
    }

    interface StringRouteAction extends StringRouteItem, ActionItem {
    }

    type ObjectRouteItem = {
        pattern?: Obj
        children?: Set<ObjectRouteItem | ObjectRouteAction>
    }

    interface ObjectRouteAction extends ObjectRouteItem, ActionItem {
    }

    /**
     * -------------------------------------------------------------------------------------
     * Utility
     */

    function registerComponents<T extends any[]>(components: [...T], register: <C extends ClassType>(component: C) => InstanceType<C>): RecurseConstruct<T>
    function registerComponents<T>(components: T, register: <C extends ClassType>(component: C) => InstanceType<C>): RecurseConstruct<T>

    function registerDecorator<C extends ClassType>(component: C, callback: (instance: InstanceType<C>, container: Container) => void, sequence?: number): void

    function implementDecorator<C extends ClassType>(component: C, instance: InstanceType<C>, container: Container): void

    function getMapValue<K, V>(data: Map<K, V>, key: K): V | undefined
    function getMapValue<K, V>(data: Map<K, V>, key: K, defaultValue: () => V): V
    function getMapValue<K extends object, V>(data: WeakMap<K, V>, key: K): V | undefined
    function getMapValue<K extends object, V>(data: WeakMap<K, V>, key: K, defaultValue: () => V): V

    function joinPath(path1: string, path2: string, separateWithSlash: boolean): string

    function assignObject(obj1: Obj, obj2?: Obj): Obj

    function matchObject(routeObject: Obj, invokeObject: Obj): boolean

    function isPromise<T>(it: any): it is Promise<T>
}

export = Roost
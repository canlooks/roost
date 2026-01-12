declare namespace Roost {
    /**
     * -------------------------------------------------------------------------------------
     * App
     */

    function createApp<T extends any[]>(modules: [...T]): RecurseConstruct<T>
    function createApp<T>(modules: T): RecurseConstruct<T>

    /**
     * -------------------------------------------------------------------------------------
     * Module
     */

    function Module(modules: any): ClassDecorator

    /**
     * -------------------------------------------------------------------------------------
     * Container
     */

    const Container: {
        get<C extends Component>(component: C): InstanceType<C>
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

    function Inject(component: Component): PropertyDecorator

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

    function invoke<T = any>(path: string, ...args: any): T
    function invoke<T = any>(pattern: Obj, ...args: any): T

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
     * Utility
     */

    /**
     * -------------------------------------------------------------------------------------
     * Internal types
     */

    type Component<I = any, A = any> = new (...args: A[]) => I
    type Fn<R = any, A = any, T = any> = (this: T, ...args: A[]) => R
    type Obj<V = any, K extends string = string> = Record<K, V>

    type RecurseConstruct<T> = T extends Component<infer R> ? R
        : T extends Map<infer K, infer R> ? Map<K, RecurseConstruct<R>>
            : T extends Set<infer R> ? Set<RecurseConstruct<R>>
                : T extends Record<any, any> | any[] ? { [K in keyof T]: RecurseConstruct<T[K]> }
                    : T

    type ActionItem = {
        component: Component
        propertyKey: PropertyKey
    }

    type StringRouteItem = {
        children?: Map<string, StringRouteItem | StringRouteAction>
    }

    interface StringRouteAction extends StringRouteItem, ActionItem {
    }

    type ObjectRouteItem = {
        pattern?: Obj
        children?: Set<ObjectRouteItem | ObjectRouteAction>
    }

    interface ObjectRouteAction extends ObjectRouteItem, ActionItem {
    }

    type PluginHooks = {

    }
}

export = Roost
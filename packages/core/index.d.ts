declare namespace Roost {
    type ComponentType<T = any> = new () => T

    type Pattern = Record<any, any>

    type RouteItem = {
        option: Record<any, any>
        instance: object
        property: string
    }
}

export = Roost
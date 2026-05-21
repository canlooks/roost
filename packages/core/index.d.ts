declare namespace Roost {
    type ComponentType<T = any> = new () => T

    type Pattern = Record<string, string | number | symbol>

    type RouteItem = {
        option: Record<any, any>
        instance: object
        property: string
    }

    type PatternMapValue = {
        value: string | number | symbol
        children: PatternMap
    }

    type PatternMap = Map<string, PatternMapValue | RouteItem>
}

export = Roost
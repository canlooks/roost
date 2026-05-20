declare namespace Roost {
    type ComponentType<T = any> = new () => T

    type Pattern = Record<any, any>
}

export = Roost
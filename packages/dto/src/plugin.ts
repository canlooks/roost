import {PluginDefinition} from '@canlooks/roost'

export const builtInName = Symbol('dto')

export default function dtoPlugin(): PluginDefinition {
    return {
        name: builtInName
    }
}
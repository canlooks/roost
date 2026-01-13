import {Obj, ObjectRouteAction, ObjectRouteItem, StringRouteAction, StringRouteItem} from '../index'
import {assignObject, joinPath} from './utility'

export const stringRoutes = new Set<StringRouteItem>()

export const objectRoutes = new Set<ObjectRouteItem>()

export const flattedStringRoutes = new Map<string, StringRouteAction>()
export const flattedObjectRoutes = new Map<Obj, ObjectRouteAction>()

export function makeRoutesFlat() {
    flatStringRoutes()
    flatObjectRoutes()
}

function flatStringRoutes() {
    const fn = (set: Set<StringRouteItem | StringRouteAction>, parentPath = '') => {
        for (const routeItem of set) {
            // "可选路径"以`{`开头,且前面没有`/`。https://www.npmjs.com/package/path-to-regexp
            const joinedPath = joinPath(parentPath, routeItem.path, !routeItem.path.startsWith('{'))
            if ('component' in routeItem) {
                flattedStringRoutes.set('/' + joinedPath, routeItem)
            } else if (routeItem.children) {
                fn(routeItem.children, joinedPath)
            }
        }
    }
    fn(stringRoutes)
}

function flatObjectRoutes() {
    const fn = (set: Set<ObjectRouteItem | ObjectRouteAction>, parentPattern = {}) => {
        for (const routeItem of set) {
            const assignedPattern = assignObject(parentPattern, routeItem.pattern)
            if ('component' in routeItem) {
                flattedObjectRoutes.set(assignedPattern, routeItem)
            } else if (routeItem.children) {
                fn(routeItem.children, assignedPattern)
            }
        }
    }
    fn(objectRoutes)
}
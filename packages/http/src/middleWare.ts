import {Express, Handler, NextFunction, Request, Response} from 'express'
import {ClassType, isClass, Roost} from '@canlooks/roost'

export type MiddleWare = Handler | ClassType

export function useMiddleWares(roost: Roost, app: Express, middleWares?: MiddleWare | MiddleWare[]) {
    if (!middleWares) {
        return
    }
    if (!Array.isArray(middleWares)) {
        middleWares = [middleWares]
    }
    const handlers = middleWares.map(middleWare => {
        if (!isClass(middleWare)) {
            return middleWare
        }
        return (req: Request, res: Response, next: NextFunction) => {
            const instance = new middleWare(req, res, next)
            roost.container.set(middleWare, instance)
        }
    })
    app.use(...handlers)
}
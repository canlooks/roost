import {Fn, getInsertParamsIndex, getInsertQueryIndex, printError, Roost} from '@canlooks/roost'
import {Express} from 'express'
import {component_propertyKey_method} from './actions'
import {getInsertReqIndex} from './request'
import {getInsertResIndex} from './response'
import {Exception} from './exception'
import {HttpPluginOptions} from './plugin'

export function entryPoints(roost: Roost, app: Express, options: HttpPluginOptions) {
    for (const [path, {component, propertyKey}] of roost.routeMap) {
        const method = component_propertyKey_method.get(component)?.get(propertyKey)
        if (method) {
            app[method](path, async (req, res) => {
                const instance = roost.container.get(component)
                const args = [req.body]

                const insert = (fn: Fn, insertValue: any) => {
                    const index = fn(component, propertyKey)
                    if (index !== null) {
                        args[index] = insertValue
                    }
                }
                insert(getInsertReqIndex, req)
                insert(getInsertResIndex, res)
                insert(getInsertParamsIndex, req.params)
                insert(getInsertQueryIndex, req.query)

                let returnValue
                try {
                    returnValue = await instance[propertyKey].apply(instance, args)
                } catch (e: any) {
                    printError(component, propertyKey)

                    if (e instanceof Exception) {
                        res.statusCode = e.statusCode || 500
                        if (e.statusMessage) {
                            res.statusMessage = e.statusMessage
                        }
                    } else {
                        res.statusCode = 500
                    }
                    options.errorHandler
                        ? res.send(await options.errorHandler(e, req, res))
                        : res.send(e)
                    return
                }

                options.responseHandler
                    ? res.send(await options.responseHandler(returnValue, req, res))
                    : res.send(returnValue)
            })
        }
    }
}
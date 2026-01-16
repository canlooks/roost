import {logPrefix, PluginDefinition} from '@canlooks/roost'
import express, {Request, Response} from 'express'
import {entryPoints} from './entryPoints'
import getPort from 'get-port'
import {MiddleWare, useMiddleWares} from './middleWare'

export type HttpPluginOptions = {
    port?: number
    callback?: (error: Error | undefined) => void
    middleWares?: MiddleWare | MiddleWare[]
    responseHandler?: (value: any, req: Request, res: Response) => any
    errorHandler?: (error: Error | undefined, req: Request, res: Response) => any
}

export const builtInName = Symbol('http')

export default function httpPlugin(options: HttpPluginOptions): PluginDefinition {
    return {
        name: builtInName,
        async onCreate(roost) {
            const app = express()

            useMiddleWares(roost, app, options.middleWares)

            entryPoints(roost, app, options)

            const port = options.port || await getPort({port: 3000})

            app.listen(port, error => {
                if (options.callback) {
                    options.callback(error)
                } else {
                    console.log(logPrefix + `HTTP server listening at http://localhost:${port}`)
                }
            })
        }
    }
}
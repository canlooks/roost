import {PluginFunction} from '@canlooks/roost'
import express from 'express'

const http: PluginFunction<{
    port?: number
    callback?: (error: Error | undefined) => void
}> = (options) => ({
    onCreated: roost => {
        const app = express()

        app.all(/.*/, async (req, res) => {
            try {
                res.json(await roost.invoke(req.originalUrl, req.body))
            } catch (e) {
                // TODO 做到这里，需要错误类
                // res.statusCode = 404
                // res.end()
            }
        })

        app.listen(options.port, error => {
            console.log(`HTTP server listening at http://localhost:${options.port}`)
            options.callback?.(error)
        })
    }
})

export default http
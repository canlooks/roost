import {Action, App, Controller, Inject, Params, Query, Roost} from '@canlooks/roost'
import http, {Exception, Get, Post} from '../src'

class AccessDeniedException extends Exception {
    override statusCode = 401
}

@Controller('sub')
class Sub {
    @App app!: Roost

    text = 'hi'

    // @Inject(() => import('./test2')) asy: any

    @Post('hello/:id')
    async hello(@Params params: { id: string }, @Query query: { search: string }) {
        await new Promise(r => setTimeout(r, 1000))
        // return this.text
        throw new AccessDeniedException()
    }
}

const app = Roost.use(
    http({
        port: 3000
    })
).create(Sub, () => {
})
import {Action, Controller, Params, Query, Roost} from '@canlooks/roost'
import http from '../src'

@Controller('sub')
class Sub {
    text = 'hi'

    @Action('hello/:id')
    async hello(@Params params: { id: string }, @Query query: URLSearchParams) {
        await new Promise(r => setTimeout(r, 1000))
        console.log(33, params, params.id)
        console.log(35, query, query.get('search'))
        return this.text
    }
}

const app = Roost.use(http, {
    port: 3000
}).create(Sub, () => {
})
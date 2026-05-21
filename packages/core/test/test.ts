import {Roost} from '../src/app'
import {Action, Controller} from '../src/controller'

@Controller('ctrl')
class A {
    @Action('act')
    action() {

    }
}

console.log('start')

Roost.create(A).then(app => {
    console.table(app.pathMap)
})
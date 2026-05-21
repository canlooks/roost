import {Roost} from '../src/app'
import {Action, Controller} from '../src/controller'
import {inspect} from 'util'

@Controller({ctrl: 'A'})
class A {
    @Action({act: 'act1'})
    @Action({act: 'act1'})
    action() {

    }
}

console.log('start')

Roost.create(A).then(app => {
    console.log(inspect(app.patternMap))
})
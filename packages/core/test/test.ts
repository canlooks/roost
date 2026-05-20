import {Module} from '../src/module'
import {Initialize} from '../src/initialize'
import {Roost} from '../src/app'
import {Inject} from '../src/inject'

class D {
    status?: string

    @Initialize
    async init() {
        console.log('D init start')
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('D init')
        this.status = 'OK'
    }
}

class B {
    @Inject(D)
    d!: D

    @Initialize
    init() {
        console.log('B init', this.d.status)
    }
}

class C {
    @Initialize
    async init() {
        console.log('C init start')
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('C init')
    }
}

@Module([B, C])
class A {
    @Initialize
    init() {
        console.log('A init')
    }
}

console.log('start')

Roost.create(A).then(() => {
    console.log('end')
})
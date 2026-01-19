import mq from 'amqplib'

(async () => {
    const connection = await mq.connect('amqp://admin:admin@localhost')

    const channel = await connection.createChannel()

    await channel.assertQueue('test')

    await channel.consume('test', message => {
        if (message) {
            console.log('replyTo', message.properties.replyTo)
            channel.sendToQueue(message.properties.replyTo, Buffer.from('Got it!'), {
                correlationId: message.properties.correlationId
            })
            channel.ack(message)
            console.log('message', message.content.toString())
        }
    })

    console.log('RabbitMQ connection started')
})()
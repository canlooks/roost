import mq from 'amqplib'

(async () => {
    const queue = 'test'

    const connection = await mq.connect('amqp://admin:admin@localhost')

    const channel = await connection.createChannel()

    await channel.assertQueue(queue)

    channel.sendToQueue(queue, Buffer.from('HAHA!'))
})()
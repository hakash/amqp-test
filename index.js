require("dotenv").config();
var amqp = require("amqplib/callback_api");

const username = process.env.RMQ_USER;
const password = process.env.RMQ_PASS;
const queue = process.env.RMQ_QUEUE;
const host = process.env.RMQ_HOST;

const connectionString = `amqp://${username}:${password}@${host}/`;

function connectionHandler(err, conn){
    if(err){
        console.log(err);
        return;
    }

    conn.createChannel(channelHandler);
}

function channelHandler(err, channel){
    if(err){
        console.log(err);
        return;
    }

    channel.assertQueue(queue, {durable:true});
    channel.prefetch(1);

    let consumer = new Consumer(channel);

    channel.consume(queue, consumer.getHandler());
}

class Consumer {
    constructor(channel) {
        this.channel = channel;
    }
    
    getHandler() {
        var self = this;
        
        return function(envelope){

            var msg = this.getMessageFromEnvelope(envelope);

            console.log(" [x] Got: ", msg);

            /**
             * TODO: Do much work here...
             */

            this.channel.ack(envelope);

        }.bind(this);
    }

    getMessageFromEnvelope(envelope) {
        var msgstring = envelope.content.toString();
        try {
            var msg = JSON.parse(msgstring);
        }
        catch (err) {
            console.log(err);
            var msg = {};
        }
        return msg;
    }
}


amqp.connect(connectionString, connectionHandler);

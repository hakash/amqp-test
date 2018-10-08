require("dotenv").config();

const username = process.env.RMQ_USER;
const password = process.env.RMQ_PASS;
const queue = process.env.RMQ_QUEUE;
const host = process.env.RMQ_HOST;

var amqp = require("amqplib/callback_api");

amqp.connect(`amqp://${username}:${password}@${host}/`, function(err, conn){
    if(err){
        console.log(err);
        return;
    }

    conn.createChannel(function(err, ch){
        if(err){
            console.log(err);
            return;
        }
        var q = queue;
        var msg = JSON.stringify({ "message": (process.argv.slice(2).join(" ") || "Hello World!") });

        ch.assertQueue(q, {durable: true});
        ch.sendToQueue(q, new Buffer(msg),{persistent:true});
        console.log(" [x] Sent: '%s'", msg);

        setTimeout(function() { conn.close(); process.exit(0) }, 200);
    });
});
// const {Server} = require("socket.io");
//
// const socketStream = require('socket.io-stream')
// const io = new Server({ /* options */});
//
//
// io.on("connection", (socket) => {
//     console.log(socket.id); // ojIckSD2jqNzOqIrAGzL
// });
//
// io.listen(3001, {});
//
//
//


const fastify = require("fastify");

const fastifyIO = require("fastify-socket.io");
const cors = require('@fastify/cors')


const server = fastify();

server.register(cors, {

    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

})
server.register(fastifyIO, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


server.get("/", (req, reply) => {
    server.io.emit("hello");
});

server.ready().then(() => {


    server.io.on('connect', (socket) => {
        console.log('connected', socket.id)
    })
});

server.listen({port: 3001});







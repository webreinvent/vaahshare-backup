

const fastify = require("fastify");
const socketio = require('fastify-socket.io');
const cors = require('@fastify/cors')
const app = fastify({logger: true})
const peer = require('simple-peer');

app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

app.register(socketio, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, reply) => {
  fastify.io.emit("hello");
});

app.ready((err) => {
  if (err) throw err;

  app.io.on("connect", (socket) => {
    console.info("Socket connected!", socket.id);

    socket.on('stream', (stream) => {
      console.log("started");
      // Broadcast the stream to all other clients
      socket.broadcast.emit('stream', stream);
    });
    socket.on('signal', (data) => {
      console.log('signalling')
      // Broadcast the signaling data to the other peer
      socket.broadcast.emit('signal', data);
    });
  });
});

app.listen({port: 3001});

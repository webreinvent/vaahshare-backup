//
//
// const createClient = require("redis")
// const fastify = require("fastify");
// const Server = require('socket.io');
// const {createAdapter} = require("@socket.io/redis-streams-adapter")
//
// //
// // const redisClient = createClient({url: "redis://localhost:6379"});
// //
// //  redisClient.connect();
//
// const io = new Server({
//     // adapter: createAdapter(redisClient)
// });
//
// io.on("connection", (socket) => {
//     console.log('connected')
// });
//
// io.listen(7000);
//
//
// const app = fastify({logger: true});
//
//
// app.register(require("fastify-socket.io"), {
//     // put your options here
// });
//
// app.get("/", (req, reply) => {
//     fastify.io.emit("hello");
// });
//
// app.listen({port: 3000});



const {Server} = require('socket.io');
const {v4: uuidv4} = require('uuid');

const io = new Server(3000, {
  cors: {
    origin: '*', // Specify the allowed origin
    methods: ['GET', 'POST'], // Specify the allowed methods
  },
});

let MAX_CLIENTS = 2;
let ns_queue = [];
let clientNamespaceMap = {};


function createNamespace() {
  let ns = {
    id: uuidv4(),
    clients: [],
  };

  ns_queue.push(ns);

  return ns;
}


let main = io
  .of('')
  .on('connection', function (socket) {
    socket.on('joinDynNs', function (data, join_cb) {
      let last_ns = ns_queue[ns_queue.length - 1];

      // Check if the client is already associated with a namespace
      if (clientNamespaceMap[socket.id]) {
        join_cb({error: 'Already joined a namespace.'});
        return;
      }

      if (last_ns.clients?.length >= MAX_CLIENTS) {
        last_ns = createNamespace();

        let dyn_ns = io.of('/' + last_ns.id)
          .on('connection', function (ns_socket) {

            console.log('connected')
            let client_id = uuidv4();
            ns_socket.client_id = client_id;
            last_ns.clients?.push(client_id);

            // Store the association between client ID and namespace ID
            clientNamespaceMap[client_id] = last_ns.id;

            console.log('User ' + client_id + ' connected to ' + last_ns.id);

            ns_socket.on('disconnect', function () {
              // Handle disconnects, clean up namespaces, etc.
              console.log('User ' + client_id + ' disconnected from ' + last_ns.id);
              // Remove the association when a client disconnects
              delete clientNamespaceMap[client_id];
            });
          });

        // Update the reference to last_ns after creating a new namespace
        last_ns = ns_queue[ns_queue.length - 1];

        ns_socket.join(last_ns.id);
      }

      join_cb({namespace: last_ns.id});
    });
  });


io.on('connection', (socket) => {
  console.log('Main namespace connected');
});


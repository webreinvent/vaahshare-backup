//
//
// import fastify from 'fastify';
// import { Server } from 'socket.io';
// import adapter from 'fastify-socket.io';
//
// const app = fastify();
// const io = new Server(app.server, {
// adapter: adapter(app),
// });
//
// // Store shared streams with their channel IDs
// const streams = {};
//
// // Generate unique channel IDs
// function generateChannelId() {
// // Implement your preferred method for generating unique IDs, such as uuidv4
// }
//
// // ==== Electron-specific routes and events ====
//
// // Handle incoming screen-sharing streams from the Electron app
// app.post('/share-screen', async (req, res) => {
// const stream = req.body.stream;
// const channelId = generateChannelId();
// streams[channelId] = stream;
//
// // Broadcast to all connected clients (Electron and web app)
// io.emit('screen-sharing-started', channelId);
//
// res.send({ channelId });
// });
//
// // ==== Web app-specific routes ====
//
// // Handle joining a channel from the web app
// app.get('/join/:channelId', async (req, res) => {
// const channelId = req.params.channelId;
// if (!streams[channelId]) {
// return res.status(404).send('Channel not found');
// }
// res.send({ stream: streams[channelId] });
// });
//
// // ==== Socket.io connection and event handling ====
//
// io.on('connection', (socket) => {
// console.log('Client connected');
//
// // Handle events for joining and leaving channels, screen sharing, and other interactions
// // specific to Electron or web app clients
// });
//
// // ==== Server start ====
//
// const startServer = async () => {
// try {
// await app.listen(3000, (err, address) => {
// if (err) throw err;
// console.log(Server listening on ${address});
// });
// } catch (error) {
// console.error('Server start error:', error);
// }
// };
//
// // export { startServer };


const createClient = require("redis")
const fastify = require("fastify");
const Server = require('socket.io');
const {createAdapter} = require("@socket.io/redis-streams-adapter")

//
// const redisClient = createClient({url: "redis://localhost:6379"});
//
//  redisClient.connect();

const io = new Server({
    // adapter: createAdapter(redisClient)
});

io.on("connection", (socket) => {
    console.log('connected')
});

io.listen(7000);


const app = fastify({logger: true});


app.register(require("fastify-socket.io"), {
    // put your options here
});

app.get("/", (req, reply) => {
    fastify.io.emit("hello");
});

app.listen({port: 3000});
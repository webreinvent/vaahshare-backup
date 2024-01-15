// const NodeMediaServer = require('node-media-server')
//
// const config = {
//     rtmp: {
//         port: 1935,
//         chunk_size: 6000,
//         gop_cache: true,
//         ping: 30,
//         ping_timeout: 60
//     },
//     http: {
//         port: 8001,
//         allow_origin: "*"
//     }
// }
//
// var nms = new NodeMediaServer(config);
// nms.run()



const RTMP = require('rtmp2');

const rtmpServer = RTMP.createServer();

rtmpServer.on('client', client => {
  client.on('command', command => {
    //  console.log(command.cmd, command);
  });

  client.on('connect', () => {
    console.log('connect', client.app);
  });

  // client.on('play', ({ streamName }) => {
  //     console.log('PLAY', streamName);
  // });
  //
  // client.on('publish', ({ streamName }) => {
  //     console.log('PUBLISH', streamName);
  // });

  client.on('stop', () => {
    console.log('client disconnected');
  });
});

rtmpServer.listen(1935);

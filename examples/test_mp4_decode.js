const beamcoder = require('../index.js'); // Use require('beamcoder') externally
const fs = require('fs');


const decoder = beamcoder.decoder({
  name: 'h264'
});
beamcoder.demuxer(process.argv[process.argv.length - 1]).then((demuxer) => {
  demuxer.read().then((packet) => {
    console.log(packet.data_cpy);
    decoder.decode(packet);
  });
});



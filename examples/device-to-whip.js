const beamcoder = require('../index.js'); // Use require('beamcoder') externally
const fs = require('fs');
const { spawn } = require('node:child_process');

const TIME_BASE = [1, 90000]; // FR * 1000 ms
const f = beamcoder.demuxers()['avfoundation'];
const encFormat = beamcoder.encoders()['libx264'];
let decs = beamcoder.decoders()['h264'];
const FRAME_RATE = 30;
const main = async () => {

  const REFERENCE_FILE = (await beamcoder.demuxer({url: '/Users/hidde/ffmpeg-build-output/bin/out.mp4'}));
  const muxer = await beamcoder.muxer({format_name: 'whip'});
  beamcoder.logging('verbose');
  const demuxer = await beamcoder.demuxer({
    options: {
      video_size: '1280x720',
      pixel_format: 'yuyv422',
      framerate: FRAME_RATE
    },
    iformat: f, url: 'FaceTime HD Camera'
  });
  const vidStream = demuxer.streams[0];

  const filterer = await beamcoder.filterer({
    filterType: 'video',
    inputParams: [
      {
        width: vidStream.codecpar.width,
        height: vidStream.codecpar.height,
        pixelFormat: vidStream.codecpar.format,
        pixelAspect: vidStream.sample_aspect_ratio,
        timeBase: vidStream.time_base
      }],
    outputParams: [{
      pixelFormat: 'yuv420p',
    }],
    filterSpec: 'scale=1280:720',
  });
  const encoder = await beamcoder.encoder({
    width: 1280,
    height: 720,
    pix_fmt: 'yuv420p',
    name: 'libx264',
    time_base: TIME_BASE,
    framerate: [FRAME_RATE, 1],
    thread_count: 1,
    // bit_rate: 80000000,
    priv_data: {
      tune: 'zerolatency',
      preset: 'ultrafast',
      profile: 'baseline',
    },
  });
  //
  //   // Simulated SPS and PPS data (replace these with actual SPS and PPS bytes)
  //   const simulatedSPS = [0x67, 0x42, 0x80, 0x15, /* ... */];
  //   const simulatedPPS = [0x68, 0xCE, 0x3C, 0x80, /* ... */];
  //
  // // Concatenate SPS and PPS data
  //   const extradata = new Uint8Array(simulatedSPS.length + simulatedPPS.length + 8); // Allocate buffer (8 for NAL unit start codes)
  //   extradata.set([0x00, 0x00, 0x00, 0x01], 0); // Start code for SPS
  //   extradata.set(simulatedSPS, 4); // Copy SPS data after start code
  //   extradata.set([0x00, 0x00, 0x00, 0x01], simulatedSPS.length + 4); // Start code for PPS
  //   extradata.set(simulatedPPS, simulatedSPS.length + 8); // Copy PPS data after start code
  //
  // // Resulting extradata buffer contains SPS followed by PPS with NAL unit start codes
  //   console.log("Constructed extradata:", extradata);

  // console.log(encoder.codecpar.extradata);
  muxer.newStream({
    name: 'libx264',
    width: 1024,
    height: 576,
    pix_fmt: 'yuv420p',
    time_base: TIME_BASE,
    // extradata: REFERENCE_FILE.streams[0].codecpar.extradata,
    // codecpar: REFERENCE_FILE.streams[0].codecpar,
    codecpar: {
      // name: 'h264',
      // width: 1024,
      // height: 576,
      // format:"yuv420p",
      priv_data: {
        tune: 'zerolatency',
        preset: 'ultrafast',
        profile: 'baseline',
      },
      type: 'CodecParameters',
      codec_type: 'video',
      codec_id: 27,
      name: 'h264',
      codec_tag: 'avc1',
      format: 'yuv420p',
      bits_per_coded_sample: 24,
      bits_per_raw_sample: 8,
      profile: 'Constrained Baseline',
      level: 31,
      width: 1024,
      height: 576,
      field_order: 'progressive',
      chroma_location: 'left',
      extradata: Uint8Array.of(1,
        66,
        192,
        31,
        255,
        225,
        0,
        22,
        103,
        66,
        192,
        31,
        218,
        1,
        0,
        18,
        104,
        64,
        0,
        0,
        3,
        0,
        64,
        0,
        0,
        12,
        163,
        198,
        12,
        168,
        1,
        0,
        4,
        104,
        206,
        60,
        128)
    },
    framerate: [FRAME_RATE, 1],
  });
  console.log(JSON.stringify(REFERENCE_FILE.streams[0].codecpar.toJSON()));
  await muxer.openIO({
    format_name: 'whip',
    url: 'https://whip.dev-2.live.cloud.visualradioassist.live/w/HoVqunFKukEs'
  });
  await muxer.writeHeader();

  const decoder = await beamcoder.decoder({
    demuxer: demuxer,
    name: 'rawvideo',
    stream_index: 0,
  });
  let packet = await demuxer.read();
  let pks = 0;
  while (packet) {
    if (packet.stream_index === 0) {
      const decResult = await decoder.decode(packet);
      const filterResult = await filterer.filter(decResult.frames);

      const frame = filterResult[0].frames[0];
      frame.pts = pks * ( (TIME_BASE[1]/TIME_BASE[0]) / FRAME_RATE);
      frame.dts = pks * ( (TIME_BASE[1]/TIME_BASE[0]) / FRAME_RATE);

      const encResult = await encoder.encode(frame);
      if (encResult.packets.length > 0) {
        console.log('writeframe');
        console.log(pks);
        const p = encResult.packets[0];
        p.duration = 1;
        await muxer.writeFrame(p);
        pks++;
      }
    }


    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000 / FRAME_RATE);
    });
    packet = await demuxer.read();
  }

  await decoder.flush();
  await encoder.flush();

  await muxer.writeTrailer();
};
main();

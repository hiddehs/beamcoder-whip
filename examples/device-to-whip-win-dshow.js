const beamcoder = require('../index.js'); // Use require('beamcoder') externally
const fs = require('fs');

const TIME_BASE = [1, 90000]; // FR * 1000 ms
const f = beamcoder.demuxers()['dshow'];
const encFormat = beamcoder.encoders()['libx264'];
let decs = beamcoder.decoders()['h264'];
const FRAME_RATE = 30;
const main = async () => {

    const dtest = (await beamcoder.demuxer({url: 'test.mp4'}));
    const muxer = await beamcoder.muxer({format_name: 'whip'});
    beamcoder.logging('verbose');
    const demuxer = await beamcoder.demuxer({
        options: {
            video_size: '1280x720',
            pixel_format: 'yuyv422',
            framerate: FRAME_RATE
        },
        iformat: f, url: 'video=NDI Webcam Video 1'
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
        time_base: [1, FRAME_RATE],
        framerate: [FRAME_RATE, 1],
        thread_count: 1,
        max_b_frames: 0,
        bit_rate: 8000000,
        priv_data: {
            tune: 'zerolatency',
            preset: 'ultrafast',
            profile: 'baseline',
        },
    });
    muxer.newStream({
        name: 'libx264',
        width: 1024,
        height: 576,
        max_b_frames: 0,
        pix_fmt: 'yuv420p',
        time_base: TIME_BASE,
        extradata: dtest.streams[0].codecpar.extradata,
        framerate: [FRAME_RATE, 1],
        codecpar: dtest.streams[0].codecpar
    });
    await muxer.openIO({
        format_name: 'whip',
        url: 'https://whip.dev-2.live.cloud.visualradioassist.live/w/hVCRDgbZaaLp'
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
            const encResult = await encoder.encode(filterResult[0].frames);
            if (encResult.packets.length > 0) {
                console.log('writeframe');
                console.log(pks);
                const p = encResult.packets[0];
                p.duration = 1;
                p.pts = pks * (TIME_BASE[1] / FRAME_RATE);
                p.dts = pks * (TIME_BASE[1] / FRAME_RATE);
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

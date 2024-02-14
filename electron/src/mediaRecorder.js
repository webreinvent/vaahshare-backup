import { getVideoFolder } from "./helper.js"
import path from 'node:path'
const fs = require('fs');

let media_recorder = null
let videoBuffers = []
const videosPath = getVideoFolder
const startRecording = async (source_id) => {
    try {
        let stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source_id,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720,
                },
            },
        });

        media_recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm; codecs="vp8, opus"',
        });

        media_recorder.ondataavailable = async (event) => {
            console.log('[preload.ts] ondataavailable', event.data);
            if (event.data && event.data.size > 0) {
                videoBuffers.push(event.data);
            }
        };

        media_recorder.start(2000);
    } catch (e) {
        console.log('Error in startRecording', e);
    }
};

const stopRecording = async () => {
    if (media_recorder) {
        media_recorder.stop();

        const videoPath = path.join(videosPath, `${Date.now()}-local.webm`);
        const blob = new Blob(videoBuffers, {
            type: 'video/webm; codecs="vp8, opus"',
        });

        const buffer = Buffer.from(await blob.arrayBuffer());

        try {
            fs.writeFileSync(videoPath, buffer);
            console.log(`video saved at ${videoPath}`);
        } catch (error) {
            console.log('error saving video', error);
        }
    }
};

export { startRecording, stopRecording };
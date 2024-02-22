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
                    minWidth: 1920,
                    maxWidth: 1920,
                    minHeight: 1080,
                    maxHeight: 1080,
                },
            },
        });

        media_recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm; codecs=vp9',
        });

        media_recorder.ondataavailable = async (event) => {
            console.log('[preload.ts] ondataavailable', event.data.size);
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
            type: 'video/webm; codecs=vp9',
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
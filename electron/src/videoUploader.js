const fs = require('fs');
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';
import { mediaApi } from "./api/media.js";
import { getVideoFolder } from "./helper.js";
import { getSources, getMachineInfo, getAppInfo, createVideosFolder, getVideos } from './index.js';

export class VideoUploader {
    constructor(win, mediaApi) {
        this.win = win;
        this.mediaApi = mediaApi;
    }

    async checkLocalSessions(data) {
        const videos = getVideos();
        if (videos.length === 0) {
            console.log('No videos in the local folder');
            return;
        }

        const videoNames = videos.map((video) => video.name);

        try {
            const response = await this.mediaApi.getListBySocketIdAndMediaNames(data.socket_id, videoNames);
            const medias = response.data.medias;
            const mediasNames = medias.map((media) => media.name);

            this.updateVideosStatus(videos, mediasNames);

            this.win?.webContents.send('updated-videos', videos);

            await this.uploadPendingVideos(videos, data);
        } catch (error) {
            console.log('Error:', error);
        }
    }

    updateVideosStatus(videos, mediasNames) {
        videos.forEach((video) => {
            if (mediasNames.includes(video.name)) {
                video.uploaded = true;
                video.status = 'uploaded';
            } else {
                video.uploaded = false;
                video.status = 'pending';
            }
        });
    }

    async uploadPendingVideos(videos, data) {
        for (const video of videos) {
            if (video.uploaded) {
                console.log(`Video ${video.name} is already uploaded`);
                continue;
            }

            await this.uploadVideo(video, data);
        }
    }

    async uploadVideo(video, data) {
        const videoPath = path.join(getVideoFolder, video.name);
        console.log(`Uploading video from: ${videoPath}`);

        const formData = new FormData();
        const file = fs.readFileSync(videoPath);
        const fileName = path.basename(videoPath);
        const blob = new Blob([file], { type: 'video/webm' });

        formData.append('socket_id', data.socket_id);
        formData.append('company_id', data.company_id);
        formData.append('file', blob, fileName);

        try {
            await this.uploadFile(formData, videoPath, video);
            this.win?.webContents.send('upload-progress', {
                videoName: video.name,
                progress: 100,
                status: 'uploaded',
                uploaded: true,
            });
        } catch (error) {
            console.log('Error uploading video:', error.response.data);
        }
    }

    handleUploadProgress(video, progressEvent) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress for ${video.name}: ${percentCompleted}%`);
        this.win?.webContents.send('upload-progress', {
            videoName: video.name,
            progress: percentCompleted,
            status: 'uploading',
            uploaded: false,
        });
    }

    async uploadFile(formData, videoPath, video) {
        // Simulating a delay for testing, remove in production
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const axiosOptions = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => this.handleUploadProgress(video, progressEvent),
        };
        try {
            const response = await axios.post('http://localhost:3000/upload', formData, axiosOptions);
            console.log('Video uploaded:', video.name, response.data);
        } catch (error) {
            console.error('Error uploading video:', error.response.data);
        }
        // Uncomment the following block to delete the video after uploading
        // try {
        //     fs.unlinkSync(videoPath);
        //     console.log('File removed', videoPath);
        // } catch (err) {
        //     console.error(err);
        // }
    }

    //generating a unique identifier for the file content
    async calculateFileHash(filePath, chunkSize = 1024 * 1024) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
            stream.on('data', (chunk) => {
               hash.update(chunk);
            });

            stream.on('end', () => {
                resolve(hash.digest('hex'));
            });

            stream.on('error', (error) => {
                reject(error);
            });
        });
    }
}


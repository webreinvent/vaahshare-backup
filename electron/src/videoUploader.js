const fs = require('fs');
const settings = require('electron-settings');
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
        const user_host = getMachineInfo().user_host;
        if (videos.length === 0) {
            console.log('No videos in the local folder');
            return;
        }

        // Update the videos object to include the original name of the video
        const updatedVideosObj = this.updateVideosObj(videos);

        const videoNames = updatedVideosObj.map((video) => video.original_name);

        try {
            // Get the list of videos uploaded to the server with the same socket_id and user_host
            const response = await this.mediaApi.getListBySocketIdAndMediaNames(data.socket_id, user_host, videoNames);
            const medias = response.data.medias;
            const mediasNames = medias.map((media) => media.original_name);

            this.updateVideosStatus(updatedVideosObj, mediasNames);

            this.win?.webContents.send('updated-videos', updatedVideosObj);

            await this.uploadPendingVideos(updatedVideosObj, data);
        } catch (error) {
            console.log('Error:', error);
        }
    }

    updateVideosStatus(videos, mediasNames) {
        videos.forEach((video) => {
            if (mediasNames.includes(video.original_name)) {
                video.uploaded = true;
                video.status = 'Completed';
            } else {
                video.uploaded = false;
                video.status = 'Pending';
            }
        });
    }

    async uploadPendingVideos(videos, data) {
        for (const video of videos) {
            if (video.uploaded) {
                console.log(`Video ${video.original_name} is already uploaded. Skipping...`);
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
        } catch (error) {
            console.log('Error uploading video:', error.response);
        }
    }

    handleUploadProgress(video, progressEvent) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress for ${video.name}: ${percentCompleted}%`);
        this.win?.webContents.send('upload-progress', {
            original_name: video.original_name,
            progress: percentCompleted,
            status: 'uploading',
            uploaded: false,
        });
    }

    async uploadFile(formData, videoPath, video) {
        // Simulating a delay for testing, remove in production
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const socket_url = await settings.get('settings.socket_url');
        const axiosOptions = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => this.handleUploadProgress(video, progressEvent),
        };
        try {
            const response = await axios.post(`${socket_url}/upload`, formData, axiosOptions);
            console.log('Video uploaded:', video.name, response.data);
        } catch (error) {
            console.error('Error uploading video:', error);
        }
        // Uncomment the following block to delete the video after uploading
        // try {
        //     fs.unlinkSync(videoPath);
        //     console.log('File removed', videoPath);
        // } catch (err) {
        //     console.error(err);
        // }
    }

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

    calculateVideoHashes(videos) {
        return Promise.all(videos.map((video) => this.calculateFileHash(path.join(getVideoFolder, video.name))));
    }

    updateVideosObj(videos) {
        return videos.map((video) => {
            const name = video.name.split('.')[0];
            return {
                ...video,
                original_name: name,
            };
        });
    }
}


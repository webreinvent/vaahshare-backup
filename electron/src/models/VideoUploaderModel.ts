import { MediaApi } from "../api/media.js";

interface VideoUploaderModel {
    win: any;
    mediaApi: MediaApi; 

    checkLocalSessions(data: any): Promise<void>;
    updateVideosStatus(videos: any[], mediasNames: string[]): void;
    uploadPendingVideos(videos: any[], data: any): Promise<void>;
    uploadVideo(video: any, data: any): Promise<void>;
    handleUploadProgress(video: any, progressEvent: any): void;
    uploadFile(formData: any, videoPath: string, video: any): Promise<void>;
    calculateFileHash(filePath: string, chunkSize?: number): Promise<string>;
    calculateVideoHashes(videos: any[]): Promise<string[]>;
    updateVideosObj(videos: any[]): any[];
}

export default VideoUploaderModel;

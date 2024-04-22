import {defineStore, acceptHMRUpdate} from 'pinia';
import {io} from "socket.io-client";

export const useRootStore = defineStore({
    id: 'root',
    state: () => ({
        assets: null,
        assets_is_fetching: true,
        sources: [],
        is_screenshot_saved: false,
        screenshot_path: null,
        selected_source_id: null,
        saving_screenshot: false,
        is_streaming: false,
        stream: null,
        socket: {
            id: null,
            io: {
                uri: null,
            },
            _callbacks: {},
        },
        video: null,
        media_recorder: null,
        loading : true,
        is_socket_url_set: false,
        router: null,
        socket_url: null,
        app_info: null,
        company_id: null,
        online: true,
        is_paused: false,
        is_reconnecting: false,
        reconnecting_interval: null,
        reconnecting_time: 60,
        video_buffers: [],
        is_recording: false,
        videos: [],
        debug_page_loading : true,
        auto_record: false,
        machine_info : null,
        show_idle_time_dialog: false,
        is_online: true,
    }),
    getters: {},
    actions: {
        async onLoad(router)
        {
            console.log("onLoad");
            this.loading = true;

            // Get the assets
            this.getAssets();

            this.handleOnlineOfflineEvent();

            this.router = router;
            //Handle App Info
            this.handleAppInfo();

            // Handle navigation
            this.HandleNavigation();

            // Handle App Close
            this.handleAppClose();

            // Get the settings
            const { settings } = await window.ipcRenderer.invoke('get-settings');
            console.log("Settings: ", settings);
            this.socket_url = settings.socket_url;
            this.company_id = settings.company_id;

            console.log("Socket URL: ", this.socket_url);

            // If socket url is not set
            if(!this.socket_url)
            {
                console.error('Socket URL is not set');
                return;
            }
            //delete socket cache

            // Set the socket url
            this.is_socket_url_set = true;
            this.socket = io(this.socket_url, {
                query: {
                    app: 'electron'
                },
                'reconnection': true,
                'reconnectionDelay': 1000,
                'timeout': 60000,  // Set the timeout to 10,000 milliseconds (10 seconds)
                'reconnectionAttempts': 10,  // Set the maximum number of reconnection attempts to 1
            });

            // Handle socket events
            this.handleSocketEvents();

            // Get the available video sources
            this.getSources();

            // Save the screenshot
            this.saveScreenshot();

            //on media recorder stop

            // console.log(window.saveVideo.save('test'))
            window.ipcRenderer.on('updated-videos', (event, videos) => {
                this.debug_page_loading = false;
                this.videos = videos;
            });

            window.ipcRenderer.on('upload-progress', (event, videoData) => {
                this.videos = this.updateObjectInArray(
                    this.videos, 
                    v => v.original_name === videoData.original_name, {
                    status: videoData.status,
                    progress: videoData.progress,
                    uploaded: videoData.uploaded,
                });
            });

            this.handleIdleTime();
        },
        //---------------------------------------------------------------------
        async getAssets() {
            window.ipcRenderer.on('assets', (_event, assets) => {
                console.log("Assets: ", assets);
                this.assets = assets;
            });
        },
        //---------------------------------------------------------------------
        getIdleTimeMessage()
        {
            return this.assets?.localization?.idle_message || "You are idle for a long time, press OK to continue";
        },
        //---------------------------------------------------------------------
        handleIdleTime() {
            window.ipcRenderer.on('toggle-idle-time-dialog', (_event, data) => {
                if (this.isIdle()) {
                    this.show_idle_time_dialog = data.show;
                    // If the user is idle for a long time, then we need to save the alert in the database
                    window.ipcRenderer.send('save-alert-user-idle', {socket_id: this.socket.id});
                }
            });
        },
        //---------------------------------------------------------------------
        onIdleTimeDialogClose()
        {
            this.show_idle_time_dialog = false;
            window.ipcRenderer.send('toggle-idle-time-dialog', { show: false });
        },
        //---------------------------------------------------------------------
        isIdle()
        {
          return !this.is_streaming || !this.is_recording;
        },
        //---------------------------------------------------------------------
        handleAppInfo()
        {
            window.ipcRenderer.on('app-info', (_event, app_info) => {
                this.app_info = app_info;
            });
        },
        //---------------------------------------------------------------------
        handleAppClose()
        {
            window.ipcRenderer.on('app-closed', (_event, data) => {
                this.socket.emit('app-closed');
            });
        },
        //---------------------------------------------------------------------
        HandleNavigation()
        {
            window.ipcRenderer.on('navigate', (_event, route_name) => {
                console.log("Redirecting to: ", route_name);
                this.router.push({name: route_name});
            });
        },
        //---------------------------------------------------------------------
        async getSources()
        {
            const sources = await window.ipcRenderer.invoke('get-sources');
            //By default select the entire screen
            this.selected_source_id = sources[0].id;
            this.handleSource();
        },
        //---------------------------------------------------------------------
        saveScreenshot()
        {
            window.ipcRenderer.on('screenshot-saved', (_event, filePath) => {
                this.is_screenshot_saved = true;
                this.screenshot_path = filePath;

                setTimeout(() => {
                    this.is_screenshot_saved = false;
                    this.screenshot_path = null;
                }, 3000);
            });
        },
        //---------------------------------------------------------------------
        async handleSocketEvents()
        {
            this.socket.on("connect", async () => {
                console.log('Connected to the server', this.socket.id);
                this.is_socket_url_set = true;
                // Get the machine info on connect and then emit event to the server indicating that a new client has connected
                const machine_info =  await window.ipcRenderer.invoke('get-machine-info');

                window.ipcRenderer.send('update-window-title', machine_info.user_host);
                this.socket.emit('client-connected', {
                    machine_info: machine_info,
                    company_id: this.company_id
                });

               if(this.auto_record)
                {
                    console.log('Recording Finished, Starting the stream');
                    this.stopRecording();
                    this.startStream();
                    this.auto_record = false;
                    this.is_streaming = true;
                }

                //if user goes offline and then comes back online
                this.is_reconnecting = false;
            });

            this.socket.on('client-connected-success', (data) => {
                // Check if any local sessions/recordings are pending to be uploaded, only if the user
                // is online and connected to the server
                this.loading = false;
                console.log('Server Says: Client Connected Successfully');
                console.log('Checking local sessions...');
                window.ipcRenderer.send('check-local-sessions', {
                    socket_id: this.socket.id,
                    company_id: this.company_id,
                });
            });

            this.socket.on("client-disconnected", (data) => {
                console.log(data)
            });

            this.socket.on("disconnect-stream", (data) => {
                console.log("disconnect-stream")
                if(this.media_recorder)
                {
                    console.log('Stopping the media recorder');
                    this.media_recorder.stop();
                }
            });

            // When user is connected to the stream, then we start to send the video frames
            this.socket.on("connect-stream", (data) => {
                console.log("connect-stream", data)

                if (this.is_streaming) {
                    console.log('Connected to the stream, starting the stream');
                    this.startStream();
                }
                // this.setupMediaRecorder();
            });

            //on error
            this.socket.on('connect_error', (error) => {
                if(this.online)
                {
                    //If the user is online and the socket is not connected that means the wrong socket url is set
                    this.is_socket_url_set = false;
                    this.loading = false;
                }
                console.log('Socket connection error:', error);
            });

            this.socket.on('disconnect', (reason) => {
                console.log(`Disconnected from the server. Reason: ${reason}`);
            });


            // Handling the video processing events
            this.socket.on('processing-video', (data) => {
                console.log('Processing Video...', data);
                this.videos = this.updateObjectInArray(this.videos,
                        v => v.original_name === data.media.original_name,
                    { status: 'Processing', uploaded : true })
            });

            this.socket.on('video-processed', (data) => {
                console.log('Video Processed...', data);
                this.videos = this.updateObjectInArray(this.videos,
                        v => v.original_name === data.media.original_name,
                    { status: 'Completed', uploaded : true })
            });

            this.socket.on('video-error', (data) => {
                console.log('Video Error...', data);
                this.videos = this.updateObjectInArray(this.videos,
                        v => v.original_name === data.media.original_name,
                    { status: 'Error', uploaded : false })
            });
        },
        //---------------------------------------------------------------------
        takeScreenshot()
        {
            window.ipcRenderer.send('take-screenshot', this.selected_source_id);
        },
        //---------------------------------------------------------------------
        async handleSource()
        {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop', //
                            chromeMediaSourceId: this.selected_source_id,
                            minWidth: 1280,
                            maxWidth: 1280,
                            minHeight: 720,
                            maxHeight: 720
                        }
                    }
                })
                this.handleStream(this.stream)
            } catch (e) {
                this.handleError(e)
            }
        },
        //---------------------------------------------------------------------
        handleStream(stream) {
            const initializeVideo = () => {
                const video = document.querySelector('video');
                if (video) {
                    video.srcObject = stream;
                    video.onloadedmetadata = (e) => video.play();
                    this.video = video;
                } else {
                    setTimeout(initializeVideo, 100); // Retry after 100ms if video element is not available yet
                }
            };
            initializeVideo();
        },
        //---------------------------------------------------------------------
        handleError(e)
        {
            console.log(e)
        },
        //---------------------------------------------------------------------
        toggleStream()
        {
            if (this.is_streaming) {
                this.stopStream()
            } else {
                this.startStream()
            }
        },
        //---------------------------------------------------------------------
        startStream()
        {
            if (!this.selected_source_id) {
                return alert('Please select a source')
            }
            this.is_streaming = true;
            this.setupMediaRecorder();
            this.socket.emit('start-streaming', {
                socket_id: this.socket.id,
                company_id: this.company_id,
                start_time: Date.now()
            });
        },
        //---------------------------------------------------------------------
        async setupMediaRecorder()
        {
            this.media_recorder = new MediaRecorder(this.stream, {
                mimeType: 'video/webm; codecs="vp8, opus"'
            })
            this.media_recorder.ondataavailable = async (event) => {
                console.log('ondataavailable', event.data)
                // Send the data chunk over the WebSocket connection
                if (event.data && event.data.size > 0 && this.media_recorder.state === 'recording') {
                    this.socket.emit('video-frame', {
                        buffer: event.data,
                        socket_id: this.socket.id
                    });
                }
            }
            // this will send the video frame every 2 seconds
            this.media_recorder.start(2000)
        },
        //---------------------------------------------------------------------
        stopStream()
        {
            this.is_streaming = false
            this.stopMediaRecorder();
            this.deleteSettings('selected_source_id');
            this.socket.emit('stop-streaming', this.socket.id);
        },
        //---------------------------------------------------------------------
        stopMediaRecorder()
        {
            if(this.media_recorder)
            {
                this.media_recorder.stop();
            }
        },
        //---------------------------------------------------------------------
        pauseStream()
        {
            if (this.media_recorder && this.media_recorder.state === 'recording') {
                this.media_recorder.pause();
            }
        },
        //---------------------------------------------------------------------
        resumeStream()
        {
            this.media_recorder.resume();
        },
        //---------------------------------------------------------------------
        saveSettings(settings)
        {
            window.ipcRenderer.send('save-settings', settings);
            // @TODO Tried to redirect to home page, but socket are not getting connected, need to fix this
        },
        //---------------------------------------------------------------------
        saveSocketSettings()
        {
            this.socket_url = this.socket_url.trim().replace(/\/$/, '');
            this.saveSettings({
                socket_url: this.socket_url,
                company_id: this.company_id
            });
        },
        //---------------------------------------------------------------------
        deleteSettings(key)
        {
            window.ipcRenderer.send('delete-settings', key);
        },
        //---------------------------------------------------------------------
        handleOnlineOfflineEvent()
        {
            const handleOnline = async () => {
                this.online = true;
                this.is_reconnecting = true;
                console.log("You are online!");
                this.socket.connect();
            };

            const handleOffline = () => {
                this.online = false;
                console.log("You are offline!");
                if(this.is_streaming)
                {
                    this.is_streaming = false;
                    this.stopMediaRecorder();
                    this.auto_record = true;
                    console.log("You are offline!, Recording now...");
                    this.startRecording();
                }
            };
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
        },
        //---------------------------------------------------------------------
        navigate(route)
        {
            this.router.push(route);
        },
        //---------------------------------------------------------------------
        toggleRecording()
        {
            if (this.is_recording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        },
        //---------------------------------------------------------------------
        async startRecording() {
            await window.media.startRecording(this.selected_source_id);
            this.is_recording = true;
        },
        //---------------------------------------------------------------------
        stopRecording() {
            this.is_recording = false;
            window.media.stopRecording();
        },
        //---------------------------------------------------------------------
        async getVideos()
        {
            // Gettng the videos from the main process, as we can't access the file system from the renderer process
            const videos =  await window.ipcRenderer.invoke('get-videos');
            this.videos = videos;
        },
        //---------------------------------------------------------------------
        bytesToMB(bytes)
        {
            return (bytes / (1024 * 1024)).toFixed(2);
        },
        //---------------------------------------------------------------------
        updateObjectInArray(array, condition, updateProperties) {
            return array.map(obj => {
                if (condition(obj)) {
                    return {
                        ...obj,
                        ...updateProperties,
                    };
                }
                return obj;
            });
        }
        //---------------------------------------------------------------------
    }
})


// Pinia hot reload
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}

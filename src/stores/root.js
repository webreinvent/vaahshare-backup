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
        socket: null,
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
    }),
    getters: {},
    actions: {
        async onLoad(router)
        {
            console.log("onLoad");
            this.loading = true;

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
            this.selected_source_id = settings.selected_source_id;

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


            // restart stream again if it was disconnected before
            this.restartStream();

            // Save the screenshot
            this.saveScreenshot();

            //on media recorder stop

        },
        //---------------------------------------------------------------------
        async restartStream()
        {
            if(this.selected_source_id){
                console.log("Restarting the stream");
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

                    //Wait for dom to be laod, so that video element is available,
                    //@TODO: find a better way to handle this
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    this.handleStream(this.stream)

                    this.startStream();
                } catch (e) {
                    // Currently not able to handle when a new source is added or not so we just remove it from the list
                    this.sources = this.sources.filter(source => source.id !== this.selected_source_id)
                    this.handleError(e)
                }
            } else {
                console.log("No source found, no stream to restart");
            }
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
        getSources()
        {
            window.ipcRenderer.on('sources', (_event, sources) => {
                this.sources = sources;
            });
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
        handleSocketEvents()
        {
            this.loading = false;
            this.socket.on("connect", () => {
                this.is_socket_url_set = true;
                // Get the machine info on connect and then emit event to the server indicating that a new client has connected
                window.ipcRenderer.on('machine-info', (_event, data) => {
                    this.socket.emit('client-connected', {
                        machine_info: data,
                        company_id: this.company_id
                    });
                });
            });

            this.socket.on("client-disconnected", (data) => {
                console.log(data)
            });

            this.socket.on("disconnect-stream", (data) => {
                console.log("disconnect-stream")
                if(this.media_recorder)
                {
                    this.media_recorder.stop();
                }
            });

            // When user is connected to the stream, then we start to send the video frames
            this.socket.on("connect-stream", (data) => {
                console.log("connect-stream")
                this.setupMediaRecorder();
            });

            //on error
            this.socket.on('connect_error', (error) => {
                if(this.online)
                {
                    //If the user is online and the socket is not connected that means the wrong socket url is set
                    this.is_socket_url_set = false;
                    this.loading = false;
                }

                if(!this.online && this.is_streaming)
                {
                    //If the user is offline and the socket is not connected that means the user is disconnected and we need to reconnect
                    if(this.is_reconnecting) return;
                    this.is_reconnecting = true;
                    this.stopMediaRecorder();
                    // decrement the time
                    this.reconnecting_interval = setInterval(() => {
                        this.reconnecting_time--;
                        if(this.reconnecting_time === 0)
                        {
                            this.is_reconnecting = false;
                            this.reconnecting_time = 60;
                            this.stopStream();
                            clearInterval(this.reconnecting_interval);
                        }
                    }, 1000);
                }
                console.log('Socket connection error:', error);
            });

            this.socket.on('disconnect', (reason) => {
                console.log(`Disconnected from the server. Reason: ${reason}`);
            });
        },
        //---------------------------------------------------------------------
        takeScreenshot()
        {
            window.ipcRenderer.send('take-screenshot', this.selected_source_id);
        },
        //---------------------------------------------------------------------
        async onSourceChanged()
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
                // Currently not able to handle when a new source is added or not so we just remove it from the list
                this.sources = this.sources.filter(source => source.id !== this.selected_source_id)
                this.handleError(e)
            }
        },
        //---------------------------------------------------------------------
        handleStream(stream)
        {
            const video = document.querySelector('video')
            video.srcObject = stream
            video.onloadedmetadata = (e) => video.play()
            this.video = video
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
            //Delete the selected source id from the settings, we already utilized it to restart the stream
            this.deleteSettings('selected_source_id');
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

                    if(this.online)
                    {
                        this.socket.emit('video-frame', {
                            buffer: event.data,
                            socket_id: this.socket.id
                        });
                    }
                    else {
                        window.ipcRenderer.send('save-video-frame', {
                            buffer: event.data.toString('base64'),
                        });
                    }
                }
            }
            // this will send the video frame every 2 seconds
            this.media_recorder.start(2000)
        },
        //---------------------------------------------------------------------
        stopStream()
        {
            this.is_streaming = false
            this.selected_source_id = null
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
        saveSettings()
        {
            window.ipcRenderer.send('save-settings', {
                socket_url: this.socket_url,
                company_id: this.company_id
            });
            // @TODO Tried to redirect to home page, but socket are not getting connected, need to fix this
        },
        //---------------------------------------------------------------------
        deleteSettings(key)
        {
            window.ipcRenderer.send('delete-settings', key);
        },
        //---------------------------------------------------------------------
        handleOnlineOfflineEvent()
        {
            window.addEventListener('online', () => {
                this.online = true;
                //reloading the page to connect the socket. socket.connect() is not working
                window.location.reload();
            });

            window.addEventListener('offline', () => {
                this.online = false;
                window.ipcRenderer.send('save-settings', {
                    selected_source_id: this.selected_source_id
                });
                console.log('offline')
            });
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
        startRecording()
        {
            this.is_recording = true;
            this.setupMediaRecorder();
            // this.media_recorder.start();
        },
        //---------------------------------------------------------------------
        stopRecording() {
            this.is_recording = false;
            this.media_recorder.stop();
            window.ipcRenderer.send('stop-recording');
        },
        //---------------------------------------------------------------------
    }
})


// Pinia hot reload
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}

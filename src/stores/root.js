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
    }),
    getters: {},
    actions: {
        onLoad(router)
        {
            this.router = router;
            window.ipcRenderer.on('app-info', (_event, app_info) => {
                this.app_info = app_info;
            });

            // Handle navigation
            this.HandleNavigation();

            this.socket_url = import.meta.env.VITE_SOCKET_URL;
            if(!this.socket_url)
            {
                window.ipcRenderer.send('is_socket_url_set', false);
                console.error('Socket URL is not set');
                return;
            }
            this.is_socket_url_set = true;
            this.loading = false;
            this.socket = io(import.meta.env.VITE_SOCKET_URL, {
                query: {
                    app: 'electron'
                }
            });
            // Handle socket events
            this.handleSocketEvents();

            // Get the available video sources
            this.getSources();

            // Save the screenshot
            this.saveScreenshot();
        },
        //---------------------------------------------------------------------
        HandleNavigation()
        {
            console.log('HandleNavigation');
            window.ipcRenderer.on('navigate', (_event, route_name) => {
                console.log(route_name);
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
            this.socket.on("connect", () => {
                // Get the machine info on connect and then emit event to the server indicating that a new client has connected
                window.ipcRenderer.on('machine-info', (_event, data) => {
                    this.socket.emit('client-connected', {
                        machine_info: data,
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
            if (!this.selected_source_id) {
                return alert('Please select a source')
            }
            this.is_streaming = true;
            this.setupMediaRecorder();
            this.socket.emit('start-streaming', {
                socket_id: this.socket.id,
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
                console.log('ondataavailable', event.data.size)
                // Send the data chunk over the WebSocket connection
                if (event.data && event.data.size > 0) {
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
            if(this.media_recorder)
            {
                this.media_recorder.stop();
            }
            this.socket.emit('stop-streaming', this.socket.id);
        },
        //---------------------------------------------------------------------
        saveSocketUrl()
        {
            //set the socket url to env variable
            //verify that url is valid
            window.ipcRenderer.send('set-socket-url', this.socket_url);
        }
    }
})


// Pinia hot reload
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}

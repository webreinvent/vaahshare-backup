import {defineStore, acceptHMRUpdate} from 'pinia';
import {io} from "socket.io-client";

export const useRootStore = defineStore({
    id: 'root',
    state: () => ({
        assets: null,
        gutter: 20,
        assets_is_fetching: true,
        count:0,
        sources: [],
        is_screenshot_saved: false,
        screenshot_path: null,
        selected_source_id: null,
        saving_screenshot: false,
        is_streaming: false,
        stream: null,
        socket: null,
        peerConnection: null,
    }),
    getters: {},
    actions: {
        onLoad()
        {
            this.socket = io('http://localhost:3000');
            this.handleSocketEvents();








            // Get the available video sources
            window.ipcRenderer.on('sources', (_event, sources) => {
                this.sources = sources;
            });

            // Save the screenshot
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
                console.log('connected')
            });

            this.socket.on("new-client-connected", (data) => {
                console.log(data)
            });


            this.socket.on("client-disconnected", (data) => {
                console.log(data)
            });




            setTimeout(() => {
                this.socket.emit("message", "Hello From the Client");
            }, 3000);
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
        async startStream()
        {
            this.is_streaming = true

            try {

                const peerConnection = new RTCPeerConnection();
                this.stream.getTracks().forEach(track => peerConnection.addTrack(track, this.stream));

                peerConnection.onicecandidate = event => {
                    if (event.candidate) {
                        this.socket.emit('candidate', event.candidate);
                    }
                }

                peerConnection.onnegotiationneeded = async () => {
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
                    this.socket.emit('offer', offer);
                }

                this.socket.emit('start-streaming', {
                    source_id: this.selected_source_id,
                })
            }

            catch (e) {
                    console.log(e)
                }
            // this.socket.emit('start-streaming', 'start-streaming')
        },
        //---------------------------------------------------------------------
        stopStream()
        {
            this.is_streaming = false
            this.socket.emit('stop-streaming', 'stop-streaming')
        },

    }
})


// Pinia hot reload
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}

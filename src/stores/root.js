import {defineStore, acceptHMRUpdate} from 'pinia';
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
    }),
    getters: {},
    actions: {
        onLoad()
        {
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
        takeScreenshot()
        {
            window.ipcRenderer.send('take-screenshot', this.selected_source_id);
        },
        //---------------------------------------------------------------------
        async onSourceChanged()
        {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
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
                this.handleStream(stream)
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
        }
    }
})


// Pinia hot reload
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}

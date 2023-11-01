import {defineStore, acceptHMRUpdate} from 'pinia';

export const useRootStore = defineStore({
  id: 'root',
  state: () => ({
    assets: null,
    gutter: 20,
    assets_is_fetching: true,
    count:0
  }),
  getters: {},
  actions: {
    //---------------------------------------------------------------------

    //---------------------------------------------------------------------
    test()
    {
      console.log("test")

      this.count++;

    }
    //---------------------------------------------------------------------
    //---------------------------------------------------------------------
    //---------------------------------------------------------------------

  }
})


// Pinia hot reload
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}

<script setup lang="ts">
import {onMounted} from "vue";
import {useRootStore} from "../stores/root";

const store = useRootStore();

onMounted(() => {
  store.onLoad();
})
</script>

<template>
  <div class="window">
    <div class="success-message" id="successMessage" v-if="store.is_screenshot_saved" >Success! {{ store.screenshot_path }}</div>
    <video class="preview"></video>
    <div class="dropdown-container">
      <label for="screenDropdown">Select Screen:</label>
      <select id="screenDropdown" class="dropdown" v-model="store.selected_source_id" @change="store.onSourceChanged">
        <option v-for="source in store.sources" :key="source.id" :value="source.id">
          {{ source.name }}
        </option>
      </select>
    </div>
    <div class="button-container">
      <button class="button">Start/Stom Stream</button>
      <button class="button" @click="store.takeScreenshot">Take Screenshot</button>
    </div>
  </div>
</template>

<style scoped>
.dropdown-container {
  width: 100%;
  margin-top: 20px;
}

.dropdown {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.window {
  width: 100%;
  height: max-content;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
}

.button {
  flex: 1;
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.button:hover {
  background-color: #45a049;
}

.button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview {
  width: 100%;
  height: 200px; /* Set a fixed height for the preview */
  background-color: #ddd; /* Placeholder color for the preview */
  border-radius: 5px;
  margin-top: 20px;
}

.success-message {
  width: 100%;
  padding: 10px;
  background-color: #2ecc71;
  color: #fff;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/*.success-message {*/
/*  padding: 20px;*/
/*  background-color: #4caf50;*/
/*  color: #fff;*/
/*  border-radius: 5px;*/
/*  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);*/
/*  text-align: center;*/
/*}*/
</style>

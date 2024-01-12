<template>
  <h1 class="head">Vaah Share</h1>
  <div class="main_wrapper">
    <viewScreens msg="yoo" class="center"/>
  </div>

</template>

<script>
import viewScreens from "@/components/viewScreens";



export default {
  name: 'App',
  components: {
    viewScreens,


  }
}
</script>

<style>

@import url('https://fonts.googleapis.com/css2?family=Rubik+Doodle+Shadow&display=swap');

#app {

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}


.main_wrapper {

  justify-content: center;
  display: flex;
}

.left {
  flex: 1
}

.center {
  flex: 3;
}

.right {
  flex: 1;

}

.head {
  font-family: "Rubik Doodle Shadow";
  font-size: 60px;
  padding: 1rem;
}

</style>

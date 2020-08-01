<template>
  <div class="home">
    <div class="outer">
     <vue-scrollbar 
      ref="scrollbar"
      :scrollX="true"
      :scrollY="true"
      scrollbarColor="rgba(191,191,191,0.45)"
      scrollbarHoverColor="rgba(191,191,191,1)"
      :size="8"
      :border-radius="0"
      :offset="0"
      @scroll-max="onMax"
    >
      <div class="inner1">
        <div class="inner1-1"><span>Left</span></div>
        <div class="inner1-2"><span>Right</span></div>
      </div>
      <div class="inner2">
        <span>Middle</span>
      </div>
      <div class="inner3"></div>
     </vue-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  mounted () {
  },
  methods: {
    onMax (info) {
      console.log('onMax', info)
    }
  }
}
</script>

<style scoped>
.outer{
  margin: 20px;
  border: 1px solid gray;
  width: 600px;
  height: 500px;
  font-size: 30px;
}

.inner1{
  display: flex;
  width: 800px;
  height: 350px;
}
.inner1-1{
  width: 50%;
  height: 100%;
  background-color: #999;
  color: red;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inner1-2{
  width: 50%;
  height: 100%;
  background-color: #aaa;
  color: blue;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inner2{
  height: 350px;
  width: 800px;
  background-color: #888;
  color: yellow;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner3{
  height: 400px;
  background-color: #333;
}

</style>
<template>
  <div
    class="vue-scrollbar"
    @click="calculateSize"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    ref="scrollWrapper"
  >
    <div
      class="vue-scroll-view"
      :class="{
        'disable-scroll-x': !scrollX,
        'disable-scroll-y': !scrollY
      }"
      ref="scrollViewer"
      @wheel="scroll"
      :style="{
        marginTop: this.top * -1 +'px',
        marginLeft: this.left * -1 +'px'
      }"
    >
      <slot></slot>
      <resize-detector @resize="onResize"></resize-detector>
    </div>
    <vertical-scrollbar
      v-if="isReady && scrollY"
      :color="scrollbarColor"
      :y-bar-display="yBarDisplay"
      :size="size"
      :border-radius="borderRadius"
      :offset="offset"
      :viewer-height="viewerHeight"
      :wrapper-height="wrapperHeight"
      :scrolling="vMovement"
      @dragging="onScrollbarDragging"
      @drag-stop="onScrollbarDragStop"
      @change-position="onChangePosition"
      ref="vscroll"
    >
    </vertical-scrollbar>
    <horizontal-scrollbar
      v-if="isReady && scrollX"
      :color="scrollbarColor"
      :x-bar-display="xBarDisplay"
      :size="size"
      :border-radius="borderRadius"
      :offset="offset"
      :viewer-width="viewerWidth"
      :wrapper-width="wrapperWidth"
      :scrolling="hMovement"
      @dragging="onScrollbarDragging"
      @drag-stop="onScrollbarDragStop"
      @change-position="onChangePosition"
      ref="hscroll"
    >
    </horizontal-scrollbar>
    <resize-detector @resize="onResize"></resize-detector>
  </div>
</template>

<script>
import VerticalScrollbar from './VerticalScrollbar.vue'
import HorizontalScrollbar from './HorizontalScrollbar.vue'
import ResizeDetector from './ResizeDetector.vue'

export default {
  name: 'VueScrollbar',
  data () {
    return {
      scrollWrapper: null,
      scrollViewer: null,
      isReady: false,
      top: 0,
      left: 0,
      viewerHeight: null,
      viewerWidth: null,
      wrapperHeight: null,
      wrapperWidth: null,
      vMovement: 0,
      hMovement: 0,
      dragging: false,
      allowBodyScroll: false,
    }
  },
  props: {
    step: { type: Number, default: 50 }, // 鼠标滚动一次，视图对应的位移值
    scrollbarColor: { type: String, default: '#DFDFDF' }, // 滚动条颜色
    scrollX: { type: Boolean, default: true }, // 是否启用水平方向滚动
    scrollY: { type: Boolean, default: true }, // 是否启用垂直方向滚动
    xBarDisplay: { type: String, default: 'hover' }, // 水平方向滚动条显示时机：hover show hidden
    yBarDisplay: { type: String, default: 'hover' }, // 垂直方向滚动条显示时机：hover show hidden
    size: { type: Number, default: 6 }, //垂直滚动条宽度，水平滚动条高度
    borderRadius: { type: Number, default: 4 }, // 滚动条圆角
    offset: { type: Number, default: 0 } // 滚动条向内偏移量
  },
  mounted () {
    this.scrollWrapper = this.$refs.scrollWrapper
    this.scrollViewer = this.$refs.scrollViewer
    this.calculateSize()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
    this.scrollWrapper = null
    this.scrollViewer = null
  },
  methods: {
    // 鼠标滚轮滚动
    scroll (e) {
      this.calculateSize(() => {
        let step = this.step

        let shifted = e.shiftKey
        let scrollY = e.deltaY > 0 ? step : -(step)
        let scrollX = e.deltaX > 0 ? step : -(step)
        if(shifted && e.deltaX == 0) scrollX = e.deltaY > 0 ? step : -(step)

        let nextY = this.top + scrollY
        let nextX = this.left + scrollX
        let canScrollY = this.viewerHeight > this.wrapperHeight
        let canScrollX = this.viewerWidth > this.wrapperWidth

        this.allowBodyScroll = true
        if (canScrollY && !shifted) this.normalizeVertical(nextY)
        if (shifted && canScrollX) this.normalizeHorizontal(nextX)

        if (!this.allowBodyScroll) {
          e.preventDefault()
          e.stopPropagation()
        }
      })
    },
    onResize () {
      this.calculateSize(() => {
        let canScrollY = this.viewerHeight > this.wrapperHeight
        let canScrollX = this.viewerWidth > this.wrapperWidth
        
        canScrollY ? this.normalizeVertical(this.top) : this.top = 0
        canScrollX ? this.normalizeHorizontal(this.left) : this.left = 0

        if (canScrollY) {
          this.normalizeVertical(this.top)
        } else {
          this.top = 0
          this.$emit('scroll-y', { top: true, bottom: false, value: 0 })
        }

        if (canScrollX) {
          this.normalizeHorizontal(this.left)
        } else {
          this.left = 0
          this.$emit('scroll-x', { left: true, right: false, value: 0 })
        }
      })
    },
    // 鼠标移入滚动区
    onMouseenter () {
      this.calculateSize(() => {
        if (this.$refs.vscroll) {
          this.$refs.vscroll.showBar()
        }
        if (this.$refs.hscroll) {
          this.$refs.hscroll.showBar()
        }
      })
    },
    // 鼠标移出滚动区
    onMouseleave () {
      if (this.$refs.vscroll) {
        this.$refs.vscroll.hiddenBar()
      }
      if (this.$refs.hscroll) {
        this.$refs.hscroll.hiddenBar()
      }
    },
    scrollToY (y) {
      this.normalizeVertical(y)
    },
    scrollToBottom () {
      const size = this.getSize()
      const outOfViewHeight = size.viewerHeight - size.wrapperHeight
      this.normalizeVertical(outOfViewHeight + 1)
    },
    scrollToX (x) {
      this.normalizeHorizontal(x)
    },
    scrollToRight () {
      const size = this.getSize()
      const outOfViewWidth = size.viewerWidth - this.wrapperWidth
      this.normalizeHorizontal(outOfViewWidth + 1)
    },
    normalizeVertical (next) {
      const size = this.getSize()
      const outOfViewHeight = size.viewerHeight - size.wrapperHeight

      const maxBottom = next >= (outOfViewHeight - 2)
      if (maxBottom) next = outOfViewHeight
      const maxTop = next <= 2
      if (maxTop) next = 0

      // 去抖动
      const shouldScroll = Math.abs(this.top - next) > 2

      this.allowBodyScroll = !shouldScroll
      if (shouldScroll) {
        this.top = next
        this.vMovement = next / size.viewerHeight * 100

        if (maxTop || maxBottom) {
          this.$emit('scroll-max', { top: maxTop, bottom: maxBottom, right: false, left: false })
        }

        this.$emit('scroll-y', { top: maxTop, bottom: maxBottom, value: next })
      }
    },
    normalizeHorizontal (next) {
      const size = this.getSize()
      const outOfViewWidth = size.viewerWidth - this.wrapperWidth

      const maxRight = next >= (outOfViewWidth - 2)
      if(maxRight) next = outOfViewWidth
      const maxLeft = next <= 2
      if(maxLeft) next = 0

      // 2px裕量，用于去抖动
      const shouldScroll = Math.abs(this.left - next) > 2

      this.allowBodyScroll = !shouldScroll
      if (shouldScroll) {
        this.left = next,
        this.hMovement = next / size.viewerWidth * 100

        if (maxRight || maxLeft) {
          this.$emit('scroll-max', { right: maxRight, left: maxLeft, top: false, bottom: false })
        }

        this.$emit('scroll-x', { right: maxRight, left: maxLeft, value: next })
      }
    },
    // 滚动条位置改变。movement：改变后的位置百分比。orientation：方向
    // 根据新的位置百分比，计算viewer视图的偏移量（marginTop/marginLeft）
    onChangePosition (movement, orientation) {
      this.calculateSize(() => {
        let next = movement / 100
        if (orientation === 'vertical') this.normalizeVertical(next * this.viewerHeight)
        if (orientation === 'horizontal') this.normalizeHorizontal(next * this.viewerWidth)
      })
    },
    // 滚动条正在拖拽
    onScrollbarDragging () {
      this.dragging = true
    },
    // 滚动条停止拖拽
    onScrollbarDragStop () {
      this.dragging = false
    },
    // 获取wrapper和viewer的高度/宽度
    getSize () {
      if (!this.scrollViewer || !this.scrollWrapper) {
        return {
          viewerHeight: null,
          viewerWidth: null,
          wrapperHeight: null,
          wrapperWidth: null
        }
      }
      return {
        viewerHeight: this.scrollViewer.clientHeight,
        viewerWidth: this.scrollViewer.clientWidth,
        wrapperHeight: this.scrollWrapper.clientHeight,
        wrapperWidth: this.scrollWrapper.clientWidth
      }
    },
    // 计算wrapper和viewer的高度/宽度，刷新缓存值。
    calculateSize (cb) {
      if(typeof cb !== 'function') cb = null

      let size = this.getSize()
      if(size.wrapperHeight !== this.wrapperHeight ||
        size.wrapperWidth !== this.wrapperWidth ||
        size.viewerHeight !== this.viewerHeight ||
        size.viewerWidth !== this.viewerWidth ) {

        this.viewerHeight = size.viewerHeight
        this.viewerWidth = size.viewerWidth
        this.wrapperHeight = size.wrapperHeight
        this.wrapperWidth = size.wrapperWidth

        this.$emit('size', {
          viewerHeight: this.viewerHeight,
          viewerWidth: this.viewerWidth,
          wrapperHeight: this.wrapperHeight,
          wrapperWidth: this.wrapperWidth
        })

        this.isReady = true
        return cb ? cb() : false
      }
      return cb ? cb() : false
    }
  },
  components: { VerticalScrollbar, HorizontalScrollbar, ResizeDetector } 
}
</script>

<style scoped>
.vue-scrollbar{
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.vue-scroll-view{
  position: relative;
  box-sizing: border-box;
  min-height: 100%;
  min-width: 100%;
  display: inline-block;
}
.vue-scroll-view.disable-scroll-x{
  width: 100%;
  overflow-x: hidden;
}
.vue-scroll-view.disable-scroll-y{
  height: 100%;
  overflow-y: hidden;
}
</style>
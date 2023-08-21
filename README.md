# changba-dialog-plugin

open dialog with instruction method in vue2

## install

```bash
npm i @changba/dialog-plugin
```

## usage

how to import

```js
import Vue from "vue";
import ChangbaDialogPlugin from "@changba/dialog-plugin";
Vue.use(ChangbaDialogPlugin);
```

how to use

```vue
<script>
export default {
  name: "Demo",
  methods: {
    handleClick() {
      // you have defined a component named by `Modal`
      this.$openDialog(
        "Modal",
        {
          // 弹窗组件的保留配置，该属性不会传递给Vue组件，可以用它来控制弹窗关闭的时候不销毁，只会在第一次创建的时候才会有效，除非你已经调用了closeAllDialog(销毁了所有)
          // destroy: false
          // ...其他，正常透传到组件中作为属性
        },
        {
          // events，配置组件内部触发的事件的回调
        }
      );
    },
    handleClose() {
      // close dialog
      this.$closeDialog();
    },
  },
};
</script>
```

## lifecycle

生命周期示例代码：

```vue
<template>
  <div>我是一个组件</div>
</template>

<script>
export default {
  name: 'LifecycleDemo'
  onShow() {
    console.log("on show");
  },
};
</script>
```

开启弹窗：

```vue
<script>
export default {
  name: "Demo",
  methods: {
    handleClick() {
      this.$openDialog(
        "LifecycleDemo",
        {
          destroy: false,
        },
        {
          // events，配置组件内部触发的事件的回调
        }
      );
    },
    handleClose() {
      this.$closeDialog();
    },
  },
};
</script>
```

当`LifecycleDemo`组件被`DialogPlugin`插件再次渲染的时候，会触发其预设的`onShow`方法。

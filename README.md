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
          // 弹窗组件的保留配置，该属性不会传递给Vue组件，可以用它来控制弹窗关闭的时候不销毁
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

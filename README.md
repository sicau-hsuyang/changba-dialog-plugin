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
      this.$openDialog("Modal");
    },
    handleClose() {
      // close dialog
      this.$closeDialog();
    },
  },
};
</script>
```

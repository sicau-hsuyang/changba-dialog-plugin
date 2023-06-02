import { VueConstructor, ComponentInstance } from "vue";
let dialogInstance: ComponentInstance[] = [];

export default {
  install(Vue: VueConstructor) {
    function _close(destroyInstance: ComponentInstance) {
      if (!destroyInstance) {
        console.log("destroyInstance not exist");
        return;
      }
      destroyInstance.$destroy();
      document.body.removeChild(destroyInstance.$el);
      dialogInstance = dialogInstance.filter((v) => v !== destroyInstance);
    }

    /**
     * 打开一个弹窗
     * @param dialogType
     * @param params
     * @return { any }
     */
    const openDialog = (dialogType: string, params = { singleInstance: true }, events: Record<string, Function> = {}) => {
      const outlet = document.createElement("div");
      outlet.classList.add("dialog");
      document.body.appendChild(outlet);
      const { singleInstance, ...rest } = params;
      const thisInstance = new Vue({
        render: (h) => {
          return h(dialogType, {
            props: rest,
            attrs: rest,
            on: {
              ...events,
              close: _close,
            },
          });
        },
      }).$mount(outlet);
      // 替换第一个instance，如果有
      if (singleInstance) {
        const firstInstance = dialogInstance.shift();
        firstInstance && _close(firstInstance);
        dialogInstance.unshift(thisInstance);
      } else {
        dialogInstance.push(thisInstance);
      }
      return { close: _close.bind(this, thisInstance), instance: thisInstance };
    };

    /**
     * 关闭弹窗
     * @returns
     */
    function closeDialog(destroyInstance: ComponentInstance) {
      if (dialogInstance.length === 0) {
        console.log("当前弹窗已经关闭，请先打开再关闭!");
        return;
      }
      if (destroyInstance) {
        _close(destroyInstance);
      } else {
        dialogInstance.forEach((ins) => {
          _close(ins);
        });
      }
    }

    Vue.prototype.$closeDialog = closeDialog;
    Vue.prototype.$openDialog = openDialog;
  },
};

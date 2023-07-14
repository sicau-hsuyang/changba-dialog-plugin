import { VueConstructor, ComponentInstance } from "vue";
let dialogInstanceStack: ComponentInstance[] = [];
let activeDialogInstance: ComponentInstance | null = null;

export default {
  install(Vue: VueConstructor) {
    /**
     * 打开一个弹窗
     * @param dialogType
     * @param params
     */
    const openDialog = (dialogType: string, params = { destroy: true }, events: Record<string, Function> = {}) => {
      const outlet = document.createElement("div");
      outlet.classList.add("dialog");
      document.body.appendChild(outlet);
      const { destroy, ...rest } = params;
      const thisInstance = new Vue({
        render: (h) => {
          return h(dialogType, {
            props: rest,
            attrs: rest,
            on: {
              ...events,
              close: closeAllDialog,
            },
          });
        },
      }).$mount(outlet);
      // 设置当前弹窗为活跃弹窗
      activeDialogInstance = thisInstance;
      return { close: closeDialog.bind(this, destroy), instance: thisInstance };
    };

    /**
     * 关闭弹窗
     * @returns
     */
    const closeDialog = (destroy = true) => {
      if (!activeDialogInstance) {
        console.log("your need hide or destroy dialog instance not exist");
        return;
      }
      // 如果需要销毁的话，直接销毁就好，并且要把栈中存储的之前的弹窗打开
      if (destroy) {
        destroyDialog(true);
      } else {
        // 将弹窗的DOM隐藏，然后加入到堆栈中去
        const el = activeDialogInstance.$el as HTMLElement;
        el.style.display = "none";
        dialogInstanceStack.push(activeDialogInstance);
      }
      activeDialogInstance = null;
    };

    /**
     * 销毁当前的活跃弹窗
     * @returns
     */
    const destroyDialog = (showPreDialog: boolean) => {
      if (!activeDialogInstance) {
        console.log("your need hide or destroy dialog instance not exist");
        return;
      }
      activeDialogInstance.$destroy();
      document.body.removeChild(activeDialogInstance.$el);
      if (dialogInstanceStack.length) {
        activeDialogInstance = dialogInstanceStack.pop()!;
        // 将当前活跃的弹窗显示为活跃
        if (showPreDialog) {
          const el = activeDialogInstance.$el as HTMLElement;
          el.style.display = "block";
        }
      }
    };

    /**
     * 关闭所有弹窗
     */
    const closeAllDialog = () => {
      while (activeDialogInstance) {
        destroyDialog(false);
      }
    };

    Vue.prototype.$closeAllDialog = closeAllDialog;
    Vue.prototype.$closeDialog = closeDialog;
    Vue.prototype.$openDialog = openDialog;
  },
};

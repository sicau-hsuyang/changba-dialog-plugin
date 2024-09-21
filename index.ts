import { VueConstructor, ComponentInstance } from "vue";
import { Store } from "vuex";
import type { IVueI18n } from 'vue-i18n'
const metaMap = new Map();
const dialogTypeMap = new Map();
let dialogInstanceStack: ComponentInstance[] = [];
let activeDialogInstance: ComponentInstance | null = null;

type CustomEvents = {
  $refs: {
    root?: {
      $options: {
        onShow?: Function;
      };
    };
  };
};

type LockOptions = {
  unlock?: () => void;
  lockScroll?: () => void;
};

/**
 * 遍历Vue的组件树，如果发现有CbDialog或者CbModal这类组件，需要增加锁定
 * @param instance
 * @returns
 */
function lockComponentsTree(instance?: ComponentInstance) {
  if (!instance) {
    return;
  }
  const queue: Array<ComponentInstance & LockOptions> = [instance];
  while (queue.length) {
    const comp = queue.shift()!;
    if (typeof comp.lockScroll === "function") {
      comp.lockScroll();
      return;
    }
    if (Array.isArray(comp.$children)) {
      queue.push(...comp.$children);
    }
  }
}

/**
 * 遍历Vue的组件树，如果发现有CbDialog或者CbModal这类组件，需要解除锁定
 * @param instance
 * @returns
 */
function unlockComponentsTree(instance?: ComponentInstance) {
  if (!instance) {
    return;
  }
  const queue: Array<ComponentInstance & LockOptions> = [instance];
  while (queue.length) {
    const comp = queue.shift()!;
    if (typeof comp.unlock === "function") {
      comp.unlock();
      return;
    }
    if (Array.isArray(comp.$children)) {
      queue.push(...comp.$children);
    }
  }
}

interface PluginOptions {
  store?: Store<unknown>;
  i18n?: IVueI18n;
}

function waitRenderEnd(root: ComponentInstance) {
  let timer: number;
  let counter = 0;
  return new Promise((resolve) => {
    timer = setInterval(() => {
      const isEl = root.$el.nodeType === 1;
      const isChildEl = root.$children?.[0]?.$el?.nodeType === 1;
      if (counter > 300) {
        clearInterval(timer);
        resolve(false);
        return;
      }
      if (isEl || isChildEl) {
        clearInterval(timer);
        resolve(true);
      } else {
        counter++;
      }
    }, 30);
  });
}

/**
 * 极端情况下就算有弹窗，也要销毁
 */
function fallbackDialog() {
  const dialogEl = document.querySelector(".cb-dialog");
  if (!dialogEl) {
    return;
  }
  dialogEl.parentNode?.removeChild(dialogEl);
}

export default {
  install(Vue: VueConstructor, options: PluginOptions = {}) {
    const { store, i18n } = options;
    /**
     * 将某个弹窗实例设置为显示
     * @param instance
     */
    const showAnyDialog = (instance: ComponentInstance & CustomEvents) => {
      const meta = metaMap.get(instance) as {
        destroy: Boolean;
        display: string;
        el: HTMLElement;
      };
      meta.el.style.display = meta.display || "block";
      typeof instance.$refs.root?.$options.onShow === "function" &&
      instance.$refs.root.$options.onShow.apply(instance.$refs.root);
      lockComponentsTree(instance);
    };

    /**
     * 打开一个弹窗
     * @param dialogType
     * @param params
     */
    const openDialog = async (dialogType: string, params = {}, events: Record<string, Function> = {}) => {
      // 如果前一个弹窗还活跃，则需要先处理
      if (activeDialogInstance) {
        const { destroy: preDestroy, el: parentEl } = metaMap.get(activeDialogInstance) as {
          destroy: Boolean;
          display: string;
          el: HTMLElement;
        };
        // 确实不销毁， 将之前高亮的弹窗隐藏
        if (preDestroy === false) {
          parentEl.style.display = "none";
          unlockComponentsTree(activeDialogInstance);
          dialogInstanceStack.push(activeDialogInstance);
        } else {
          destroyDialog(false, false);
        }
        activeDialogInstance = null;
      }
      // destroy配置是否销毁弹窗
      let { destroy, ...rest } = Object.assign({ destroy: true }, params);
      let thisInstance: ComponentInstance;
      let oldInstance = dialogTypeMap.get(dialogType);
      // 如果强制创建新的，先将已经存在的旧的删除
      if (!oldInstance) {
        const outlet = document.createElement("div");
        outlet.classList.add("dialog");
        document.body.appendChild(outlet);
        thisInstance = new Vue({
          store,
          i18n,
          render: (h) => {
            return h(dialogType, {
              props: rest,
              attrs: rest,
              ref: "root",
              on: {
                ...events,
                close: closeAllDialog,
              },
            });
          },
        }).$mount();
        outlet.appendChild(thisInstance.$el);
        // 等待元素的渲染完成
        // await waitRenderEnd(thisInstance);
        // 设置元数据，再稍后将尝试寻找
        metaMap.set(thisInstance, {
          // vue 实例父元素
          el: outlet,
          destroy,
          dialogType,
          // 取一个兜底
          display: getComputedStyle(outlet as HTMLElement).display,
        });
      } else {
        thisInstance = dialogTypeMap.get(dialogType);
        // 把它从不是active弹窗调整到active上去
        dialogInstanceStack = dialogInstanceStack.filter((x) => x !== oldInstance);
        showAnyDialog(thisInstance);
      }
      // 设置或更新弹窗类型
      dialogTypeMap.set(dialogType, thisInstance);
      // 设置当前弹窗为活跃弹窗
      activeDialogInstance = thisInstance;
      return { close: closeDialog, instance: thisInstance };
    };

    /**
     * 关闭弹窗
     * @returns
     */
    const closeDialog = (showPreDialog: boolean) => {
      if (!activeDialogInstance) {
        console.log("your need hide or destroy dialog instance not exist");
        fallbackDialog();
        return;
      }
      // 尝试获取
      let { destroy } = (metaMap.get(activeDialogInstance) || {}) as {
        destroy: Boolean;
        display: string;
      };
      if (typeof destroy === "undefined") {
        destroy = true;
      }
      // 如果需要销毁的话，直接销毁就好，并且要把栈中存储的之前的弹窗打开
      if (destroy) {
        destroyDialog(showPreDialog);
      } else {
        // 如果发现被禁用滚动了的话，终止禁用
        unlockComponentsTree(activeDialogInstance as ComponentInstance & LockOptions);
        // 将弹窗的DOM隐藏，然后加入到堆栈中去
        const el = (
          metaMap.get(activeDialogInstance).el
        ) as HTMLElement;
        if (el.nodeType !== 1) {
          throw new Error("元素获取不到!");
        }
        el.style.display = "none";
        dialogInstanceStack.push(activeDialogInstance);
        activeDialogInstance = null;
      }
    };

    /**
     * 销毁当前的活跃弹窗，是否需要自动填充前一个弹窗，是否展示前面一个弹窗
     * @returns
     */
    const destroyDialog = (showPreDialog: boolean, extractPreDialogToFill = true) => {
      if (!activeDialogInstance) {
        console.log("your need hide or destroy dialog instance not exist");
        fallbackDialog();
        return;
      }
      activeDialogInstance.$destroy();
      const targetEl =
        metaMap.get(activeDialogInstance).el as HTMLElement;
      try {
        document.body.removeChild(targetEl);
      } catch (exp) {
        console.log(exp);
        fallbackDialog();
      }
      const { dialogType } = metaMap.get(activeDialogInstance) || {};
      // 删除配置的元数据，防止内存泄露
      metaMap.delete(activeDialogInstance);
      dialogTypeMap.delete(dialogType);
      if (dialogInstanceStack.length && extractPreDialogToFill) {
        activeDialogInstance = dialogInstanceStack.pop()!;
        // 将当前活跃的弹窗显示为活跃
        if (showPreDialog) {
          showAnyDialog(activeDialogInstance);
        }
      } else {
        activeDialogInstance = null;
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

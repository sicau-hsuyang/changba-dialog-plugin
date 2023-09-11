import { VueConstructor } from "vue";
import { Store } from "vuex";
interface PluginOptions {
    store?: Store<unknown>;
}
declare const _default: {
    install(Vue: VueConstructor, options?: PluginOptions): void;
};
export default _default;

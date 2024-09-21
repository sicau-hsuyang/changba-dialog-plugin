import { VueConstructor } from "vue";
import { Store } from "vuex";
import type { IVueI18n } from 'vue-i18n';
interface PluginOptions {
    store?: Store<unknown>;
    i18n?: IVueI18n;
}
declare const _default: {
    install(Vue: VueConstructor, options?: PluginOptions): void;
};
export default _default;

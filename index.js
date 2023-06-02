var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var dialogInstance = [];
export default {
    install: function (Vue) {
        var _this = this;
        function _close(destroyInstance) {
            if (!destroyInstance) {
                console.log("destroyInstance not exist");
                return;
            }
            destroyInstance.$destroy();
            document.body.removeChild(destroyInstance.$el);
            dialogInstance = dialogInstance.filter(function (v) { return v !== destroyInstance; });
        }
        /**
         * 打开一个弹窗
         * @param dialogType
         * @param params
         * @return { any }
         */
        var openDialog = function (dialogType, params, events) {
            if (params === void 0) { params = { singleInstance: true }; }
            if (events === void 0) { events = {}; }
            var outlet = document.createElement("div");
            outlet.classList.add("dialog");
            document.body.appendChild(outlet);
            var singleInstance = params.singleInstance, rest = __rest(params, ["singleInstance"]);
            var thisInstance = new Vue({
                render: function (h) {
                    return h(dialogType, {
                        props: rest,
                        attrs: rest,
                        on: __assign(__assign({}, events), { close: _close }),
                    });
                },
            }).$mount(outlet);
            // 替换第一个instance，如果有
            if (singleInstance) {
                var firstInstance = dialogInstance.shift();
                firstInstance && _close(firstInstance);
                dialogInstance.unshift(thisInstance);
            }
            else {
                dialogInstance.push(thisInstance);
            }
            return { close: _close.bind(_this, thisInstance), instance: thisInstance };
        };
        /**
         * 关闭弹窗
         * @returns
         */
        function closeDialog(destroyInstance) {
            if (dialogInstance.length === 0) {
                console.log("当前弹窗已经关闭，请先打开再关闭!");
                return;
            }
            if (destroyInstance) {
                _close(destroyInstance);
            }
            else {
                dialogInstance.forEach(function (ins) {
                    _close(ins);
                });
            }
        }
        Vue.prototype.$closeDialog = closeDialog;
        Vue.prototype.$openDialog = openDialog;
    },
};

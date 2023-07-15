interface MapIterable<K, V> {
    [Symbol.iterator](): MapIterator<K, V>;
}
interface MapIterator<K, V> {
    next(value?: any): IterationResult<K, V>;
}
interface IterationResult<K, V> {
    value: [key: K, val: V];
    done: boolean;
}
export declare function MyMap<K, V>(iterator?: MapIterable<K, V>): {
    cachedVal: V;
    cachedKey: K;
    cachedKeyIdx: number;
    storageKeys: K[];
    storageContents: V[];
    readonly size: number;
    /**
     * 删除Map中的key
     * @param key
     */
    delete(key: K): boolean;
    /**
     * 设置值
     * @param key
     * @param value
     * @returns { boolean }
     */
    set(key: K, value: V): void;
    /**
     * 检测Map中是否包含某个值
     * @param key
     */
    has(key: K): boolean;
    /**
     * 获取值
     * @param key
     * @returns {any}
     */
    get(key: K): V;
    values(): {
        _index: number;
        _keys: K[];
        _values: V[];
        _selector: (key: K, value: V) => {
            key: K;
            value: V;
        };
        next(): {
            value: {
                key: K;
                value: V;
            };
            done: boolean;
        } | {
            value: undefined;
            done: boolean;
        };
        return(value: V): {
            value: V;
            done: boolean;
        };
        throw(reason: unknown): void;
        initIterator(): void;
        [Symbol.iterator](): any;
    };
    forEach(fn: (key: K, val: V, thisArgs: any) => void): void;
    entries(): {
        _index: number;
        _keys: K[];
        _values: V[];
        _selector: (key: K, value: V) => {
            key: K;
            value: V;
        };
        next(): {
            value: {
                key: K;
                value: V;
            };
            done: boolean;
        } | {
            value: undefined;
            done: boolean;
        };
        return(value: V): {
            value: V;
            done: boolean;
        };
        throw(reason: unknown): void;
        initIterator(): void;
        [Symbol.iterator](): any;
    };
    keys(): {
        _index: number;
        _keys: K[];
        _values: V[];
        _selector: (key: K, value: V) => {
            key: K;
            value: V;
        };
        next(): {
            value: {
                key: K;
                value: V;
            };
            done: boolean;
        } | {
            value: undefined;
            done: boolean;
        };
        return(value: V): {
            value: V;
            done: boolean;
        };
        throw(reason: unknown): void;
        initIterator(): void;
        [Symbol.iterator](): any;
    };
    _initCache(): void;
    _find(key: K): number;
    /**
     * 获取缓存，命中缓存返回 非负数，否则返回 -1
     * @param {any} key
     * @returns { number }
     */
    _getCache(key: K): number;
    clear(): void;
    [Symbol.iterator](): {
        _index: number;
        _keys: K[];
        _values: V[];
        _selector: (key: K, value: V) => {
            key: K;
            value: V;
        };
        next(): {
            value: {
                key: K;
                value: V;
            };
            done: boolean;
        } | {
            value: undefined;
            done: boolean;
        };
        return(value: V): {
            value: V;
            done: boolean;
        };
        throw(reason: unknown): void;
        initIterator(): void;
        [Symbol.iterator](): any;
    };
};
export {};

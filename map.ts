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

function GenerateIterator<K, V>(keys: K[], values: V[], selector?: (key: K, val: V) => unknown) {
  const SentinelArray: unknown[] = [];

  const render = (key: K, value: V) => {
    return {
      key,
      value,
    };
  };

  class MyMapIterator {
    _index = -1;

    _keys: K[] = SentinelArray as K[];

    _values: V[] = SentinelArray as V[];

    _selector = render;

    [Symbol.iterator]() {
      return this;
    }

    constructor(keys: K[], values: V[], selector?: (key: K, val: V) => unknown) {
      this._keys = keys;
      this._values = values;
      this._index = 0;
      this._selector = (selector || render) as any;
    }

    next() {
      var index = this._index;
      if (index >= 0 && index < this._keys.length) {
        var result = this._selector(this._keys[index], this._values[index]);
        if (index + 1 >= this._keys.length) {
          this.initIterator();
        } else {
          this._index++;
        }
        return { value: result, done: false };
      }
      return { value: undefined, done: true };
    }

    return(value: V) {
      if (this._index >= 0) {
        this.initIterator();
      }
      return {
        value,
        done: true,
      };
    }

    throw(reason: unknown) {
      if (this._index >= 0) {
        this.initIterator();
      }
      throw reason;
    }

    initIterator() {
      this._index = -1;
      this._keys = SentinelArray as K[];
      this._values = SentinelArray as V[];
      this._selector = render;
    }
  }

  return new MyMapIterator(keys, values, selector);
}

export function MyMap<K, V>(iterator?: MapIterable<K, V>) {
  const SentinelKey = {};

  class MyMapImplement {
    cachedVal!: V;

    cachedKey: K = SentinelKey as K;

    cachedKeyIdx = -1;

    // 存储keys
    storageKeys: K[] = [];
    // 存储值
    storageContents: V[] = [];

    [Symbol.iterator]() {
      return GenerateIterator(this.storageKeys, this.storageContents);
    }

    get size() {
      return this.storageKeys.length;
    }

    constructor(iterator?: MapIterable<K, V>) {
      // 如果有初始化参数，必须是一个迭代器
      const values = iterator && typeof iterator[Symbol.iterator] === "function" ? [...iterator] : [];
      values.length &&
        values.forEach(([key, value]) => {
          this.set(key, value);
        });
    }

    /**
     * 删除Map中的key
     * @param key
     */
    delete(key: K) {
      // 命中缓存，直接返回缓存值
      const cacheIdx = this._getCache(key);
      // 如果命中缓存值，快速删除
      if (cacheIdx > -1) {
        // 删除key
        this.storageKeys.splice(cacheIdx, 1);
        // 删除val
        this.storageContents.splice(cacheIdx, 1);
        // 初始化缓存
        this._initCache();
        return true;
      } else {
        const idx = this._find(key);
        if (idx > -1) {
          // 删除key
          this.storageKeys.splice(idx, 1);
          // 删除val
          this.storageContents.splice(idx, 1);
        }
        return idx > -1;
      }
    }

    /**
     * 设置值
     * @param key
     * @param value
     * @returns { boolean }
     */
    set(key: K, value: V) {
      // 如果存在键值，更新
      if (this.has(key)) {
        const cachedKeyIdx = this.cachedKeyIdx;
        this.storageContents[cachedKeyIdx] = value;
        this.storageKeys[cachedKeyIdx] = key;
      } else {
        // 以最后一个作为缓存
        this.cachedKey = key;
        this.cachedKeyIdx = this.storageKeys.length;
        this.storageKeys.push(key);
        this.storageContents.push(value);
      }
    }

    /**
     * 检测Map中是否包含某个值
     * @param key
     */
    has(key: K) {
      return this._find(key) > -1;
    }

    /**
     * 获取值
     * @param key
     * @returns {any}
     */
    get(key: K) {
      // 命中缓存，直接返回缓存值
      const cacheIdx = this._getCache(key);
      if (cacheIdx > -1) {
        return this.cachedVal;
      }
      // 根据Key查找索引
      const idx = this._find(key);
      // 根据索引查找值
      const val = this.storageContents[idx];
      // 找得到，设置缓存
      if (idx > -1) {
        this.cachedKey = key;
        this.cachedKeyIdx = idx;
      }
      return val;
    }

    values() {
      return GenerateIterator(this.storageKeys, this.storageContents, (key, value) => {
        return value;
      });
    }

    forEach(fn: (key: K, val: V, thisArgs: MyMapImplement) => void) {
      this.storageKeys.forEach((key, keyIdx) => {
        const val = this.storageContents[keyIdx];
        fn(key, val, this);
      });
    }

    entries() {
      return this[Symbol.iterator]();
    }

    keys() {
      return GenerateIterator(this.storageKeys, this.storageContents, (key, value) => {
        return key;
      });
    }

    _initCache() {
      this.cachedKey = SentinelKey as K;
      this.cachedKeyIdx = -1;
    }

    _find(key: K) {
      return this.storageKeys.findIndex((v) => {
        return (Number.isNaN(v) && Number.isNaN(key)) || v === key;
      });
    }

    /**
     * 获取缓存，命中缓存返回 非负数，否则返回 -1
     * @param {any} key
     * @returns { number }
     */
    _getCache(key: K) {
      return (Number.isNaN(this.cachedKey) && Number.isNaN(key)) || this.cachedKey === key ? this.cachedKeyIdx : -1;
    }

    clear() {
      this.storageKeys.length = 0;
      this.storageContents.length = 0;
      this._initCache();
    }
  }

  return new MyMapImplement(iterator);
}

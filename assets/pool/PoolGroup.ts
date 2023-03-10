/*************************************************
/* @author : rontian
/* @email  : i@ronpad.com
/* @date   : 2021-08-19
*************************************************/

import { XObject } from '../core/XObject';
import { clazz } from '../decorators/clazz';
import { TClass } from '../types/TClass';
import { Dictionary } from '../utils/Dictionary';
import { IPoolable } from './IPoolable';
import { PoolObject } from './PoolObject';

@clazz('PoolGroup')
export class PoolGroup<T extends IPoolable> extends XObject {
    private $group: string;

    public get group(): string {
        return this.$group;
    }

    private $pools = new Dictionary<string | number, PoolObject<T>>();

    public get pools(): Dictionary<string | number, PoolObject<T>> {
        return this.$pools;
    }

    public constructor(group: string) {
        super();
        this.$group = group;
    }

    public getPool(key: string | number, ClassType: TClass<T>, initCount = 0): PoolObject<T> {
        if (this.pools.containsKey(key)) {
            return this.pools.get(key);
        }
        const pool = new PoolObject<T>(ClassType, initCount);
        pool.group = this.group;
        pool.key = key;
        this.pools.add(key, pool);
        return pool;
    }

    public fetch(key: string | number, ClassType: TClass<T>, newInstance?: (...args: any[]) => T, thisObject?: any, ...args: any[]) {
        const pool = this.getPool(key, ClassType);
        return pool.fetch(newInstance, thisObject, ...args);
    }

    public recycle(key: string | number, ClassType: TClass<T>, o: T): void {
        const pool = this.getPool(key, ClassType);
        pool.recycle(o);
    }

    public release(key: string | number, ClassType: TClass<T>, loop?: (value: T) => void, thisObject?: any): void {
        const pool = this.getPool(key, ClassType);
        pool.release(loop, thisObject);
    }

    public releases(loop?: (value: T) => void, thisObject?: any): void {
        this.pools.forValues((pool) => {
            pool.release(loop, thisObject);
        }, this);
    }

    public forEach(loop: (poo: PoolObject<T>) => void, thisObject?: any): void {
        this.pools.forValues((pool) => {
            loop.apply(thisObject, [pool]);
        }, this);
    }
}

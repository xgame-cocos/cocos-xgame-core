/*************************************************
/* @author : rontian
/* @email  : i@ronpad.com
/* @date   : 2021-08-19
*************************************************/

import { clazz } from '../decorators/clazz';
import { IXObject } from '../interfaces/IXObject';
import { AsyncLock, IAsyncLockOpts } from '../utils/AsyncLock';
import { Dictionary } from '../utils/Dictionary';
import { XObject } from './XObject';

const KEY = 'this';

@clazz('Locker')
export class Locker extends XObject {
    private locker = new AsyncLock();

    public constructor() {
        super();
    }

    public acquire(handler: (done: (err?: any, ret?: any) => void) => void, complete?: (err?: any, ret?: any) => void, options?: IAsyncLockOpts): Promise<any> {
        return this.locker.acquire(KEY, handler, complete, options);
    }

    public simple(handler: () => void, thisObject?: any): Promise<void> {
        return this.acquire((done) => {
            handler.apply(thisObject);
            done();
        });
    }
}
const dict = new Dictionary<number, Locker>();
export function __lockobject__(object: IXObject): Locker {
    const hashCode = object.hashCode;
    if (!hashCode) {
        return null;
    }
    let locker: Locker;
    if (!dict.containsKey(hashCode)) {
        locker = new Locker();
        dict.add(hashCode, locker);
    } else {
        locker = dict.get(hashCode);
    }
    return locker;
}
export function __unlockobject__(object: IXObject): boolean {
    const hashCode = object.hashCode;
    if (!hashCode) {
        return false;
    }
    if (dict.containsKey(hashCode)) {
        dict.remove(hashCode);
        return true;
    }
    return false;
}

/*************************************************
/* @author : rontian
/* @email  : i@ronpad.com
/* @date   : 2021-01-21
*************************************************/
const STR = '0123456789abcdefghijklmnopqrstuvwxyz';
export class Random {
    public static range(min: number, max: number): number {
        let seed = new Date().getTime();
        max = max || 1;
        min = min || 0;
        seed = (seed * 9301 + 49297) % 233280;
        const rnd = seed / 233280.0;
        return min + rnd * (max - min);
    }

    public static chars(len = 6): string {
        let char = '';
        const count: number = STR.length;
        for (let i: number = len; i > 0; --i) {
            char += STR[Math.floor(Math.random() * count)];
        }
        return char;
    }
}

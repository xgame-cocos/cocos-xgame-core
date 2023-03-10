/*************************************************
/* @author : rontian
/* @email  : i@ronpad.com
/* @date   : 2021-01-19
*************************************************/

import { Point } from '../math/Point';
import { Rectangle } from '../math/Rectangle';

export interface AABBData {
    rect: Rectangle;
    offsetX: number;
    offsetY: number;
}
export class MathUtils {
    public static distanceBetweenTwoPoints(x1: number, x2: number, y1: number, y2: number): number {
        const dx: number = x1 - x2;
        const dy: number = y1 - y2;

        return Math.sqrt(dx * dx + dy * dy);
    }

    /*
    public static rotateAroundInternalPoint(object: DisplayObject, pointToRotateAround: Point, rotation: number): void {
        // Thanks : http://blog.open-design.be/2009/02/05/rotate-a-movieclipdisplayobject-around-a-point/

        var m: Matrix = object.transform.matrix;

        var point: Point = pointToRotateAround;
        point = m.transformPoint(point);

        RotateAroundExternalPoint(object, point, rotation);
    }

    public static rotateAroundExternalPoint(object: DisplayObject, pointToRotateAround: Point, rotation: number): void {
        var m: Matrix = object.transform.matrix;

        m.translate(-pointToRotateAround.x, -pointToRotateAround.y);
        m.rotate(rotation * (Math.PI / 180));
        m.translate(pointToRotateAround.x, pointToRotateAround.y);

        object.transform.matrix = m;
    }
    */
    /**
     * Rotates x,y around Origin (like MathVector.rotate() )
     * if resultPoint is define, will set resultPoint to new values, otherwise, it will return a new point.
     * @param	p flash.geom.Point
     * @param	a angle in radians
     * @return	returns a new rotated point.
     */
    public static rotatePoint(x: number, y: number, a: number, resultPoint: Point = null): Point {
        const c: number = Math.cos(a);
        const s: number = Math.sin(a);
        if (resultPoint) {
            resultPoint.setTo(x * c + y * s, -x * s + y * c);
            return null;
        } else return new Point(x * c + y * s, -x * s + y * c);
    }

    /**
     * Get the linear equation from two points.
     * @return an object, m is the slope and b a constant term.
     */
    public static lineEquation(p0: Point, p1: Point): Object {
        const a: number = (p1.y - p0.y) / (p1.x - p0.x);
        const b: number = p0.y - a * p0.x;

        return { m: a, b: b };
    }

    /**
     * Linear interpolation function
     * @param	a start value
     * @param	b end value
     * @param	ratio interpolation amount
     * @return
     */
    public static lerp(a: number, b: number, ratio: number): number {
        return a + (b - a) * ratio;
    }

    /**
     * returns the lerp parameter ( between 0 and 1) that produces the interpolant 'value' within the [a,b] range
     * accepts a>b or b<a but does not clamp value to [a,b] range.
     */
    public static inverseLerp(a: number, b: number, value: number): number {
        if (a > b) {
            return (value - b) / (a - b);
        } else if (a < b) {
            return (value - a) / (b - a);
        } else {
            throw new Error('a argument must be different from b argument.');
        }
    }

    /**
     * maps value from ranges A to B with
     *
     * - range A : [minA,maxA]
     * - range B : [minB,maxB]
     *
     * if minB is 0 and maxB is 1, in other words if we want to map the value to the [0,1] range,
     * map will act like the InverseLerp function
     *
     * warning : return value is clamped withing range B.
     *
     * example :
     *
     * input value is assumed to be withing the [-10,10] range.
     * required range is :[20,40].
     *
     * map(-24,-10,10,20,40); // 20 (input value is out of range A, result is clamped)
     * map(-10,-10,10,20,40); // 20 (input is the minimum value of range A, so output  will be the minimum value of range B)
     * map(0,-10,10,20,40); // 30 (input is middle of range A, output is middle of range B)
     * map(10,-10,10,20,40); // 40(input is max of range A, so output is max of range B)
     *
     * @param value value within range A
     * @param minA minimum value of range A
     * @param maxA maximum value of range A
     * @param minB minimum value of range B
     * @param maxB maximum value of range B
     */
    public static map(value: number, minA: number, maxA: number, minB = 0, maxB = 1): number {
        const t: number = MathUtils.clamp01(MathUtils.inverseLerp(minA, maxA, value));
        return t * (maxB - minB) + minB;
    }

    /**
     * Creates the axis aligned bounding box for a rotated rectangle.
     * @param w width of the rotated rectangle
     * @param h height of the rotated rectangle
     * @param a angle of rotation around the topLeft point in radian
     * @return Rectangle
     */
    public static createAABB(x: number, y: number, w: number, h: number, a = 0): Rectangle {
        const aabb: Rectangle = new Rectangle(x, y, w, h);

        if (a == 0) return aabb;

        let c: number = Math.cos(a);
        let s: number = Math.sin(a);
        let cpos: boolean;
        let spos: boolean;

        if (s < 0) {
            s = -s;
            spos = false;
        } else {
            spos = true;
        }
        if (c < 0) {
            c = -c;
            cpos = false;
        } else {
            cpos = true;
        }

        aabb.width = h * s + w * c;
        aabb.height = h * c + w * s;

        if (cpos)
            if (spos) aabb.x -= h * s;
            else aabb.y -= w * s;
        else if (spos) {
            aabb.x -= w * c + h * s;
            aabb.y -= h * c;
        } else {
            aabb.x -= w * c;
            aabb.y -= w * s + h * c;
        }

        return aabb;
    }

    /**
     * Creates the axis aligned bounding box for a rotated rectangle
     * and offsetX , offsetY which is simply the x and y position of
     * the aabb relative to the rotated rectangle. the rectangle and the offset values are returned through an object.
     * such object can be re-used by passing it through the last argument.
     * @param w width of the rotated rectangle
     * @param h height of the rotated rectangle
     * @param a angle of rotation around the topLeft point in radian
     * @param aabbdata the object to store the results in.
     * @return {rect:Rectangle,offsetX:number,offsetY:number}
     */
    public static createAABBData(x: number, y: number, w: number, h: number, a = 0, aabbdata: AABBData = null): AABBData {
        if (aabbdata == null) {
            aabbdata = <AABBData>{ offsetX: 0, offsetY: 0, rect: new Rectangle() };
        }

        aabbdata.rect.setTo(x, y, w, h);
        let offX = 0;
        let offY = 0;

        if (a == 0) {
            aabbdata.offsetX = 0;
            aabbdata.offsetY = 0;
            return aabbdata;
        }

        let c: number = Math.cos(a);
        let s: number = Math.sin(a);
        let cpos: boolean;
        let spos: boolean;

        if (s < 0) {
            s = -s;
            spos = false;
        } else {
            spos = true;
        }
        if (c < 0) {
            c = -c;
            cpos = false;
        } else {
            cpos = true;
        }

        aabbdata.rect.width = h * s + w * c;
        aabbdata.rect.height = h * c + w * s;

        if (cpos)
            if (spos) offX -= h * s;
            else offY -= w * s;
        else if (spos) {
            offX -= w * c + h * s;
            offY -= h * c;
        } else {
            offX -= w * c;
            offY -= w * s + h * c;
        }

        aabbdata.rect.x += aabbdata.offsetX = offX;
        aabbdata.rect.y += aabbdata.offsetY = offY;

        return aabbdata;
    }

    /**
     * check if angle is between angle a and b
     * thanks to http://www.xarg.org/2010/06/is-an-angle-between-two-other-angles/
     */
    public static angleBetween(angle: number, a: number, b: number): boolean {
        const mod: number = Math.PI * 2;
        angle = (mod + (angle % mod)) % mod;
        a = (mod * 100 + a) % mod;
        b = (mod * 100 + b) % mod;
        if (a < b) return a <= angle && angle <= b;
        return a <= angle || angle <= b;
    }

    /**
     * Checks for intersection of Segment if asSegments is true.
     * Checks for intersection of Lines if asSegments is false.
     *
     * http://keith-hair.net/blog/2008/08/04/find-intersection-point-of-two-lines-in-as3/
     *
     * @param	x1 x of point 1 of segment 1
     * @param	y1 y of point 1 of segment 1
     * @param	x2 x of point 2 of segment 1
     * @param	y2 y of point 2 of segment 1
     * @param	x3 x of point 3 of segment 2
     * @param	y3 y of point 3 of segment 2
     * @param	x4 x of point 4 of segment 2
     * @param	y4 y of point 4 of segment 2
     * @param	asSegments
     * @return the intersection point of segment 1 and 2 or null if they don't intersect.
     */
    public static linesIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, asSegments = true): Point {
        const a1 = y2 - y1;
        const b1 = x1 - x2;
        const c1 = x2 * y1 - x1 * y2;
        const a2 = y4 - y3;
        const b2 = x3 - x4;
        const c2 = x4 * y3 - x3 * y4;

        const denom: number = a1 * b2 - a2 * b1;
        if (denom == 0) return null;

        const ip = new Point();
        ip.x = (b1 * c2 - b2 * c1) / denom;
        ip.y = (a2 * c1 - a1 * c2) / denom;

        // ---------------------------------------------------
        // Do checks to see if intersection to endpoints
        // distance is longer than actual Segments.
        // Return null if it is with any.
        // ---------------------------------------------------
        if (asSegments) {
            if (MathUtils.pow2(ip.x - x2) + MathUtils.pow2(ip.y - y2) > MathUtils.pow2(x1 - x2) + MathUtils.pow2(y1 - y2)) return null;
            if (MathUtils.pow2(ip.x - x1) + MathUtils.pow2(ip.y - y1) > MathUtils.pow2(x1 - x2) + MathUtils.pow2(y1 - y2)) return null;
            if (MathUtils.pow2(ip.x - x4) + MathUtils.pow2(ip.y - y4) > MathUtils.pow2(x3 - x4) + MathUtils.pow2(y3 - y4)) return null;
            if (MathUtils.pow2(ip.x - x3) + MathUtils.pow2(ip.y - y3) > MathUtils.pow2(x3 - x4) + MathUtils.pow2(y3 - y4)) return null;
        }
        return ip;
    }

    public static pow2(value: number): number {
        return value * value;
    }

    public static clamp01(value: number): number {
        return value < 0 ? 0 : value > 1 ? 1 : value;
    }

    public static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * returns random Number between min and max
     */
    public static random(min = 0, max = 1): number {
        return min + (max - min) * Math.random();
    }

    /**
     * returns random int between min and max
     */
    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (1 + max - min)) + min;
    }

    /**
     * best fits the rect Rectangle into the into Rectangle, and returns what scale factor applied to into was necessary to do so.
     * @param	rect
     * @param	into
     * @return
     */
    public static getBestFitRatio(rect: Rectangle, into: Rectangle): number {
        if (into.height / into.width > rect.height / rect.width) return into.width / rect.width;
        else return into.height / rect.height;
    }

    /**
     * use to get the ratio required for one rectangle to fill the other.
     * Either the width, the height, or both will fill the into rectangle.
     * Useful to make a background take up all the screen space even though the background
     * will be cropped if the aspect ratio is not the same.
     * @param	rect
     * @param	into
     */
    public static getFillRatio(rect: Rectangle, into: Rectangle): number {
        if (into.height / into.width > rect.height / rect.width) return into.height / rect.height;
        else return into.width / rect.width;
    }

    /**
     * get a random item from an array with an almost uniform distribution of probabilities using randomInt.
     * @param	arr
     * @return
     */
    public static getArrayRandomItem(arr: any[]): any {
        return arr[MathUtils.randomInt(0, arr.length - 1)];
    }

    /**
     * gets the next element in an array based on the currentElement's position, cyclically.
     * - so if currentElement is the last element, you'll get the first in the array.
     * @param	currentElement
     * @param	array
     */
    public static getNextInArray(currentElement: any, array: any[]): any {
        let currIndex: number = array.lastIndexOf(currentElement) + 1;
        if (currIndex >= array.length) currIndex = 0;
        return array[currIndex];
    }

    /**
     * gets the previous element in an array based on the currentElement's position, cyclically.
     * - so if currentElement is the first element, you'll get the last in the array.
     * @param	currentElement
     * @param	array
     */
    public static getPreviousInArray(currentElement: any, array: any[]): any {
        let currIndex: number = array.lastIndexOf(currentElement) - 1;
        if (currIndex < 0) currIndex = array.length - 1;
        return array[currIndex];
    }

    /**
     * returns a random color in given range.
     *
     * @param minLum minimum for the r, g and b values.
     * @param maxLum maximum for the r, g and b values.
     * @param b32 return color with alpha channel (ARGB)
     * @param randAlpha if format is ARGB, shall we set a random alpha value?
     * @return
     */
    public static getRandomColor(minLum = 0, maxLum = 0xff, b32 = false, randAlpha = false): number {
        maxLum = maxLum > 0xff ? 0xff : maxLum;
        minLum = minLum > 0xff ? 0xff : minLum;

        const r: number = MathUtils.randomInt(minLum, maxLum);
        const g: number = MathUtils.randomInt(minLum, maxLum);
        const b: number = MathUtils.randomInt(minLum, maxLum);

        if (!b32) return (r << 16) | (g << 8) | b;
        else {
            const a: number = randAlpha ? MathUtils.randomInt(0, 255) : 255;
            return (a << 24) | (r << 16) | (g << 8) | b;
        }
    }

    /**
     * http://snipplr.com/view/12514/as3-interpolate-color/
     * @param	fromColor
     * @param	toColor
     * @param	t a number from 0 to 1
     * @return
     */
    public static colorLerp(fromColor: number, toColor: number, t: number): number {
        const q: number = 1 - t;
        const fromA: number = (fromColor >> 24) & 0xff;
        const fromR: number = (fromColor >> 16) & 0xff;
        const fromG: number = (fromColor >> 8) & 0xff;
        const fromB: number = fromColor & 0xff;
        const toA: number = (toColor >> 24) & 0xff;
        const toR: number = (toColor >> 16) & 0xff;
        const toG: number = (toColor >> 8) & 0xff;
        const toB: number = toColor & 0xff;
        const resultA: number = fromA * q + toA * t;
        const resultR: number = fromR * q + toR * t;
        const resultG: number = fromG * q + toG * t;
        const resultB: number = fromB * q + toB * t;
        const resultColor: number = (resultA << 24) | (resultR << 16) | (resultG << 8) | resultB;
        return resultColor;
    }

    public static abs(num: number): number {
        return num < 0 ? -num : num;
    }

    /**
     * returns -1 for negative numbers, 1 for positive (zero included)
     */
    public static sign(num: number): number {
        return num < 0 ? -1 : 1;
    }

    /**
     * quick and dirty wrap around. returns a positive value.
     */
    public static Repeat(value: number, range: number): number {
        let val: number = value;
        while (val < 0) {
            val += range;
        }
        return val % range;
    }

    // robert penner's formula for a log of variable base
    public static logx(val: number, base = 10): number {
        return Math.log(val) / Math.log(base);
    }

    /**
     * Evaluate quadratic curve ( f(x)=y ) for x = t
     * a = start
     * b = control
     * c = end
     */
    public static evaluateQuadraticCurve(a: number, b: number, c: number, t = 0): number {
        return (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
    }

    /**
     * Evaluate cubic curve ( f(x)=y ) for x = t
     * a = start
     * b = first control
     * c = second control
     * d = end
     */
    public static evaluateCubicCurve(a: number, b: number, c: number, d: number, t = 0): number {
        return a + (-a * 3 + t * (3 * a - a * t)) * t + (3 * b + t * (-6 * b + b * 3 * t)) * t + (c * 3 - c * 3 * t) * t * t + d * t * t * t;
    }

    /**
     * http://www.robertpenner.com/easing/
     * t current time
     * b start value
     * c change in value
     * d duration
     */
    public static easeInQuad(t: number, b: number, c: number, d: number): number {
        return c * (t /= d) * t + b;
    }

    public static easeOutQuad(t: number, b: number, c: number, d: number): number {
        return -c * (t /= d) * (t - 2) + b;
    }

    public static easeInCubic(t: number, b: number, c: number, d: number): number {
        return c * (t /= d) * t * t + b;
    }

    public static easeOutCubic(t: number, b: number, c: number, d: number): number {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    }

    public static easeInQuart(t: number, b: number, c: number, d: number): number {
        return c * (t /= d) * t * t * t + b;
    }

    public static easeOutQuart(t: number, b: number, c: number, d: number): number {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    }
}

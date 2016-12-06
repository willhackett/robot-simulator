"use strict";
/**
 * Definition for utility functions From 'robot.ts'
 */
class DirectionUtil {
    /**
     * Turn Left
     * @param D
     */
    static TurnLeft(D) {
        return DirectionUtil.Orders[DirectionUtil.Orders.lastIndexOf(D) - 1]; // return the previous one if the orders array
    }
    /**
     * Turn Right
     * @param D
     */
    static TurnRight(D) {
        return DirectionUtil.Orders[DirectionUtil.Orders.indexOf(D) + 1]; // return the next one if the orders array
    }
    static getDirectionVector(D) {
        return DirectionUtil.DirectionVectors[D];
    }
    /**
     * get the sum of two vectors as a new object
     * @param V1
     * @param V2
     */
    static Sum(V1, V2) {
        return { X: V1.X + V2.X, Y: V1.Y + V2.Y };
    }
}
DirectionUtil.Orders = ['NORTH', 'EAST', 'SOUTH', 'WEST', 'NORTH'];
/**define the directions as vectors */
DirectionUtil.DirectionVectors = { 'NORTH': { X: 0, Y: 1 }, 'SOUTH': { X: 0, Y: -1 }, 'WEST': { X: -1, Y: 0 }, 'EAST': { X: 1, Y: 0 } };
exports.DirectionUtil = DirectionUtil;
/**
 * define the table, which implements the IRegion
 */
class Table {
    hitTest(vector) {
        return vector.X >= this.minX && vector.X <= this.maxX && vector.Y >= this.minY && vector.Y <= this.maxY;
    }
}
exports.Table = Table;
if (module)
    module.exports = exports;
//# sourceMappingURL=util.js.map
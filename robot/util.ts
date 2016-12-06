import { ICommand, Command, Direction, IRegion, IVector, DataRoute, Log, MasterDirective, TestOptions } from './types';

/**
 * Definition for utility functions From 'robot.ts'
 */
export class DirectionUtil {
    static Orders: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST', 'NORTH'];
    /**
     * Turn Left
     * @param D
     */
    static TurnLeft(D: Direction): Direction {
        return DirectionUtil.Orders[DirectionUtil.Orders.lastIndexOf(D) - 1]; // return the previous one if the orders array
    }
    /**
     * Turn Right
     * @param D
     */
    static TurnRight(D: Direction): Direction {
        return DirectionUtil.Orders[DirectionUtil.Orders.indexOf(D) + 1]; // return the next one if the orders array
    }
    /**define the directions as vectors */
    static DirectionVectors: { [key: string]: IVector } = { 'NORTH': { X: 0, Y: 1 }, 'SOUTH': { X: 0, Y: -1 }, 'WEST': { X: -1, Y: 0 }, 'EAST': { X: 1, Y: 0 } };
    static getDirectionVector(D: Direction): IVector {
        return DirectionUtil.DirectionVectors[D];
    }
    /**
     * get the sum of two vectors as a new object
     * @param V1
     * @param V2
     */
    static Sum(V1: IVector, V2: IVector): IVector {
        return { X: V1.X + V2.X, Y: V1.Y + V2.Y };
    }
}

/**
 * define the table, which implements the IRegion
 */
export class Table implements IRegion {
    //define the table size
    public minX: number;
    public minY: number;
    public maxX: number;
    public maxY: number;
    hitTest(vector: IVector): boolean {
        return vector.X >= this.minX && vector.X <= this.maxX && vector.Y >= this.minY && vector.Y <= this.maxY;
    }
}

if (module) module.exports = exports;
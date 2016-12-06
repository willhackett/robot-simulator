"use strict";
const util_1 = require('./util');
/**
 * Implementation of complex number
 */
class ComplexNumber {
    constructor(r, i) {
        this.r = r;
        this.i = i;
    }
    /**
     * multiply with another complex number c
     * @param c
     */
    multiply(c) {
        let r = this.r * c.r - this.i * c.i;
        let i = this.r * c.i + this.i * c.r;
        this.r = r;
        this.i = i;
    }
    /**
     * add another complex number c
     * @param c
     */
    add(c) {
        let r = this.r + c.r;
        let i = this.i + c.i;
        this.r = r;
        this.i = i;
    }
    /**
     * static sum
     * @param c
     */
    static Sum(c1, c2) {
        return new ComplexNumber(c1.r + c2.r, c1.i + c2.i);
    }
    /**
     * static multiply
     * @param c
     */
    static Multiply(c1, c2) {
        return new ComplexNumber(c1.r * c2.r - c1.i * c2.i, c1.r * c2.i + c1.i * c2.r);
    }
    /**
     * static vector dot product for calculating direction with project method
     * @param c
     */
    static DotProduct(c1, c2) {
        return c1.r * c2.r + c1.i * c2.i;
    }
    toString() {
        return '(' + this.r + ', ' + this.i + ')';
    }
}
/**
 * Convertion between complex number and direction
 */
class ComplexDirectionUtil {
    /**
     * convert any complex number and round up to the closest direction
     * this uses the vector projection method
     * @param c
     */
    static toDirection(c) {
        let arr = [];
        for (let key in ComplexDirectionUtil.Directions) {
            arr.push({ key: key, value: ComplexNumber.DotProduct(ComplexDirectionUtil.Directions[key], c) });
        }
        arr.sort((a, b) => Math.sign(b.value - a.value));
        return arr[0].key;
    }
    /**
     * convert direction to complex number
     * @param d
     */
    static toComplexNumber(d) {
        let direction = ComplexDirectionUtil.Directions[d];
        return new ComplexNumber(direction.r, direction.i);
    }
}
ComplexDirectionUtil.Directions = { 'NORTH': new ComplexNumber(0, 1), 'SOUTH': new ComplexNumber(0, -1), 'WEST': new ComplexNumber(-1, 0), 'EAST': new ComplexNumber(1, 0) };
/**
 * the definition of a polygon with ray caster hit test implementation
 */
class Polygon {
    /**
     * build a polygon with points
     * @param Points
     */
    constructor(Points) {
        this.Points = Points;
        if (!this.Points || !Array.isArray(this.Points))
            this.Points = [];
    }
    /**
     * Ray caster hit test
     * @param c
     */
    HitTest(c) {
        if (this.Points.length < 3)
            return false; //at least 3 points to form a triangle
        let points = this.Points.map(p => new ComplexNumber(p.r, p.i - c.i)); //simply algorithm by set y=0;
        let r = c.r; //the x value
        let crosses = []; //obtain a list of cross points for even/odd counting
        for (let i = 0; i < points.length; i++) {
            let a = points[i];
            let b = (i + 1 < points.length) ? points[i + 1] : points[0];
            if (a.i * b.i < 0) {
                crosses.push(a.r - (a.r - b.r) / (a.i - b.i) * a.i); //add the cross point to the list
            }
        }
        return crosses.sort().filter(value => value < r).length % 2 == 1; //sort the cross point list and find if the current x value is in the odd or even region; odd for hit.
    }
}
/**
 * The Robot Tester with Complex Number and Ray Caster Hit Test algorithm to test the Robot implementation
 */
class RobotTester {
    /**indicates whether the locatino/direction are valid*/
    get Invalid() {
        return (!this.location) || (!this.direction);
    }
    /**
     * move if position/direction are valid and target is in region
     */
    move() {
        if (this.Invalid)
            return;
        if (!this.polygon.HitTest(ComplexNumber.Sum(this.location, this.direction)))
            return;
        this.location.add(this.direction);
    }
    /**
     * turn left if position/direction are valid
     */
    left() {
        if (this.Invalid)
            return;
        this.direction.multiply(new ComplexNumber(0, 1));
    }
    /**
     * turn right if position/direction are valid
     */
    right() {
        if (this.Invalid)
            return;
        this.direction.multiply(new ComplexNumber(0, -1));
    }
    /**
     * report if position/direction are valid
     */
    report() {
        if (this.Invalid)
            return;
        console.log('Tester Report: ' + this.location.r + ',' + this.location.i + ',' + ComplexDirectionUtil.toDirection(this.direction));
    }
    /**
     * DROP if target is valid
     * @param x
     * @param y
     * @param direction
     */
    drop(x, y, direction) {
        if (!this.polygon.HitTest(new ComplexNumber(x, y)))
            return;
        this.location = new ComplexNumber(x, y);
        this.direction = ComplexDirectionUtil.toComplexNumber(direction);
    }
    /**
     * execute command
     * @param command
     */
    execute(command) {
        switch (command.command) {
            case 'DROP':
                this.drop(command.X, command.Y, command.D);
                break;
            case 'MOVE':
                this.move();
                break;
            case 'LEFT':
                this.left();
                break;
            case 'RIGHT':
                this.right();
                break;
            case 'REPORT':
                this.report();
                break;
        }
    }
    /**get status for logger*/
    get Status() {
        if (this.Invalid)
            return '?,?,?';
        return this.location.r + ',' + this.location.i + ',' + ComplexDirectionUtil.toDirection(this.direction) + ',' + this.direction.r + ',' + this.direction.i;
    }
}
/**
 * The tester class
 */
class Tester {
    constructor() {
        /**keep the list of commands*/
        this.Commands = [];
        //define the robot
        this.Robot = new RobotTester();
        //define a rectangle region for the robot;
        this.Robot.polygon = new Polygon([
            new ComplexNumber(-0.5, -0.5),
            new ComplexNumber(-0.5, 9.5),
            new ComplexNumber(9.5, 9.5),
            new ComplexNumber(9.5, -0.5),
        ]);
    }
    /**
     * generate a random command
     */
    RandomCommand() {
        switch (Math.floor(Math.random() * 5)) {
            case 0:
                return {
                    command: 'DROP',
                    X: Math.floor(Math.random() * 20 - 5),
                    Y: Math.floor(Math.random() * 20 - 5),
                    D: ['NORTH', 'SOUTH', 'WEST', 'EAST'][Math.floor(Math.random() * 4)]
                };
            case 1:
                return { command: 'MOVE' };
            case 2:
                return { command: 'LEFT' };
            case 3:
                return { command: 'RIGHT' };
            case 4:
                return { command: 'REPORT' };
        }
    }
    /**
     * start specific number functions test;
     * @param numberOfCommands
     */
    Start(numberOfCommands) {
        //generate the first command
        for (let i = 0; i < numberOfCommands - 1; i++) {
            let cmd = this.RandomCommand();
            cmd.index = i;
            this.Commands.push(cmd);
        }
        //the last one is report
        this.Commands.push({ command: 'REPORT', index: numberOfCommands - 1 });
        let status = { source: 'DESIRED', index: numberOfCommands, status: '' };
        let log = { data: status, target: 'logger' };
        process.send(JSON.stringify(log));
        for (let i = 0; i < this.Commands.length; i++) {
            let data = { data: this.Commands[i], target: 'robot' };
            process.send(JSON.stringify(data));
            this.Robot.execute(this.Commands[i]);
            this.LogCommand(i, this.Commands[i]);
            this.LogStatus(i);
        }
    }
    /**
     * send command log to logger
     * @param i
     * @param command
     */
    LogCommand(i, command) {
        let status = { source: 'command', index: i, status: command.command + ((command.X && command.Y && command.D) ? (command.X + ',' + command.Y + ',' + command.D) : '') };
        let log = { data: status, target: 'logger' };
        process.send(JSON.stringify(log));
    }
    /**
     * send status log to logger
     * @param i
     */
    LogStatus(i) {
        let status = { source: 'tester', index: i, status: this.Robot.Status };
        let log = { data: status, target: 'logger' };
        process.send(JSON.stringify(log));
    }
    /**
     * Unit test to test if results of two hit test algorithms are the same
     */
    HitUnitTests() {
        console.log('@Unit Test for Table.HitTest and ray caster Polygon.HitTest:');
        console.log('10 random points will be generate to test their hit test in the [0-9]x[0-9] region');
        let table = new util_1.Table();
        table.minX = 0;
        table.minY = 0;
        table.maxX = 9;
        table.maxY = 9;
        for (let i = 0; i < 10; i++) {
            let c = new ComplexNumber(Math.floor(Math.random() * 30 - 10), Math.floor(Math.random() * 30 - 10));
            console.log('[0-9]x[0-9] region hit test for ', c.toString(), 'table: ', table.hitTest({ X: c.r, Y: c.i }), 'ray caster:', this.Robot.polygon.HitTest(c), (table.hitTest({ X: c.r, Y: c.i }) == this.Robot.polygon.HitTest(c)) ? 'Success' : 'Failed');
        }
        this.Exit();
    }
    /**
     * perform unit tests for direction and turning by multiply of complex number.
     */
    DirectionAndRotationUnitTest() {
        let c = new ComplexNumber(0, 1);
        console.log('@Unit Test for Direction and Rotation ');
        console.log('the begin direction will be randomly turned left/right for 10 times');
        let d = 'NORTH';
        console.log('Begin Direction:');
        console.log(c, ComplexDirectionUtil.toDirection(c), d);
        for (let i = 0; i < 10; i++) {
            if (Math.random() < 0.5) {
                console.log('Turn Left:');
                c.multiply(new ComplexNumber(0, 1));
                d = util_1.DirectionUtil.TurnLeft(d);
                console.log('Test turn left and direction for: ', c.toString(), ComplexDirectionUtil.toDirection(c), d, ComplexDirectionUtil.toDirection(c) == d ? 'Success' : 'Failed');
            }
            else {
                console.log('Turn Right:');
                c.multiply(new ComplexNumber(0, -1));
                d = util_1.DirectionUtil.TurnRight(d);
                console.log('Test turn right direction for: ', c.toString(), ComplexDirectionUtil.toDirection(c), d, ComplexDirectionUtil.toDirection(c) == d ? 'Success' : 'Failed');
            }
        }
        this.Exit();
    }
    /**
     * Let the master process to terminate the whole cluster
     */
    Exit() {
        let directive = { directive: 'exit' };
        let log = { data: directive, target: '<MASTER>' };
        process.send(JSON.stringify(log));
    }
}
let test = new Tester();
//listen to command from the master process
process.on('message', (value) => {
    let options = JSON.parse(value);
    switch (options.key) {
        case 'Unit Direction':
            test.DirectionAndRotationUnitTest();
            break;
        case 'Unit HitTest':
            test.HitUnitTests();
            break;
        case 'Functional':
            test.Start(options.count);
            break;
    }
});
//# sourceMappingURL=tester.js.map
import * as fs from 'fs';
import * as http from 'http';
import * as net from 'net'; 
import { ICommand, Command, Direction, IRegion, IVector, DataRoute, Log, MasterDirective } from './types';
import { Table, DirectionUtil } from './util';

/**
 * the Robot class implementing IVector
 */
class Robot implements IVector {
    public X: number;
    public Y: number;
    public D: Direction;
    public Region: Table;

    /**
     * the index system to ensure the robot execute the received command in the original order.
     * since the tester is not in the same process, the robot process may receive the message in the wrong order
     */
    public lastIndex: number = -1;

    /** the catche for command that can not be executed due the order */
    public cachedCommands: ICommand[] = [];

    /**
     * execute the command. here the Function.apply() was used to execute the command.
     * @param command
     */
    execute(command: ICommand) {
        this.cachedCommands.push(command);
        let next: ICommand;
        //execute the command in the cachedCommands until nothing can be found to execute
        while (next = this.cachedCommands.find(cmd => cmd.index == (this.lastIndex + 1))) {
            //remove the next one
            this.cachedCommands.splice(this.cachedCommands.findIndex(cmd => cmd.index == (this.lastIndex + 1)), 1);
            this.lastIndex += 1; //increment
            //execute the next command
            let func: Function = this[next.command];
            if (func) func.apply(this, [next.X, next.Y, next.D]);
            let status: Log = { source: 'robot', index: next.index, status: this.Status };
            let log: DataRoute = { data: status, target: 'logger' };
            process.send && process.send(JSON.stringify(log));
        }
    }
    /**return false if X Y D was not initialized. Prevent operations before valid DROP*/
    get uninitialized(): boolean {
        return this.X == undefined || this.Y == undefined || this.D == undefined;
    }
    /**
     * implement the add function of IVector
     * @param vector
     */
    Add(vector: IVector): void {
        this.X += vector.X;
        this.Y += vector.Y;
    }
    /**
     * DROP if the X,Y passes the hit test
     * @param X
     * @param Y
     * @param D
     */
    DROP(X: number, Y: number, D: Direction) {
        if (!this.Region.hitTest({ X: X, Y: Y })) return; //guard 
        this.X = X;
        this.Y = Y;
        this.D = D;
    }
    /**
     * MOVE if dropped and new position is valid
     */
    MOVE() {
        if (this.uninitialized) return; 
        let directionVector = DirectionUtil.getDirectionVector(this.D); 
        if (this.Region.hitTest(DirectionUtil.Sum(this, directionVector))) {
            this.Add(directionVector);
        }
    }
    /**
     * turn left if dropped
     */
    LEFT() {
        if (this.uninitialized) return; 
        this.D = DirectionUtil.TurnLeft(this.D);
    }
    /**
     * turn right if dropped
     */
    RIGHT() {
        if (this.uninitialized) return; 
        this.D = DirectionUtil.TurnRight(this.D);
    }
    /**
     * REPORT current status
     */
    REPORT() {
        if (this.uninitialized) return; 
        console.log('Output: ' + this.X + ',' + this.Y + ',' + this.D);
    }
    /**get the current status for test*/
    public get Status(): string {
        if (this.uninitialized) return '?,?,?';
        let vector = DirectionUtil.DirectionVectors[this.D];
        return this.X + ',' + this.Y + ',' + this.D + ',' + vector.X + ',' + vector.Y;
    }
}


//define the table [0-9]x[0-9]
let table = new Table();
table.minX = 0;
table.minY = 0;
table.maxX = 9;
table.maxY = 9;

//define the robot
let robot = new Robot();
robot.Region = table;


//regex for handling input from arg lines
let CommandRegEx = /((DROP)\s+([\-\+]?\d+)\s*\,\s*([\-\+]?\d+)\s*\,\s*(NORTH|SOUTH|WEST|EAST)|MOVE|LEFT|RIGHT|REPORT)/g;

/**
 * notify the user about wrong command line format
 */
function WrongFormat() {
    console.log('@Warning: Wrong Command Format');
    console.log('Please try command formats below: ');
    console.log('node robot.js inputfilename');
    console.log('node robot.js "DROP 2,2,SOUTH MOVE DROP -2,+3,NORTH LEFT RIGHT REPORT"');
}

if (process.send) {//child process mode
    process.on('message', (value: string) => {
        let data: DataRoute = JSON.parse(value);
        let command: ICommand = data.data;
        robot.execute(data.data);
    });
}
else {//command line mode
    //detect command line input and run the robot
    let cmdString: string = process.argv[2];

    //sample command line code:
    //node robot.js "DROP 2,2,SOUTH MOVE LEFT MOVE MOVE RIGHT REPORT"
    //positive and negative numbers can also be accepted:
    //node robot.js "DROP 2,2,SOUTH MOVE DROP -2,+3,NORTH LEFT RIGHT REPORT"
    if (cmdString) {
        let commands: ICommand[] = [];

        //try read the input file
        let filename = __dirname + '/' + cmdString;
        let data: string = '';

        if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {
            data = fs.readFileSync(filename).toString();
        }
        else { //try read commands from command 
            data = cmdString;
        }
        CommandRegEx.lastIndex = undefined;
        let match: RegExpExecArray;
        let index: number = 0;
        while (match = CommandRegEx.exec(data)) {
            if (/^DROP/.test(match[1])) {
                commands.push({
                    command: <Command>match[2], X: Number(match[3]), Y: Number(match[4]), D: <Direction>match[5], index: index
                })
                index += 1;
            }
            else {
                commands.push({
                    command: <Command>match[1], index: index
                })
                index += 1;
            }
        }
        if (commands.length > 0) {
            //execute each command line for the robot;
            commands.forEach(cmd => robot.execute(cmd));
        }
        else {
            WrongFormat();
        }
    }
    else {
        WrongFormat();
    }
}


import * as child_process from 'child_process'; 
import { ICommand, Command, Direction, IRegion, IVector, DataRoute, MasterDirective, TestOptions } from './types';
/**
 * The master controller of child processes
 */
class MasterController {
    /** the object for child processes*/
    public ChildProcesses: { [key: string]: child_process.ChildProcess } = {};
    public get hasAny(): boolean {
        for (let key in this.ChildProcesses) {
            return true;
        }
        return false;
    }
    /**
     * Create a new child process and start to listen it's message.
     * @param key
     * @param path
     */
    public Fork(key: string, path: string) {
        this.ChildProcesses[key] = child_process.fork(path);
        let that = this;
        this.ChildProcesses[key].on("message", (data: string) => {
            that.Dispatch(data);
        });
    }
    /**
     * Dispatch the data to target child process;
     * @param data
     */
    public Dispatch(data: string) {
        let route: DataRoute = JSON.parse(data);
        if (route.target == '<MASTER>') {
            let directive: MasterDirective = route.data;
            switch (directive.directive) {
                case 'kill':
                    if (this.ChildProcesses[directive.name]) this.ChildProcesses[directive.name].kill();
                case 'exit':

                    process.exit();
                    break;
            }
            //exit if no child process is alive
            if (!this.hasAny) process.exit();
        }
        if (this.ChildProcesses[route.target]) {
            this.ChildProcesses[route.target].send(data);
        }
    }
}


//create the master controller instance
let Master = new MasterController();

//create child processes
Master.Fork('logger', 'logger.js');
Master.Fork('robot', 'robot.js');
Master.Fork('tester', 'tester.js');


//send test information to the tester process

//command line format:
//node master.js -f
//node master.js -d

let cmd = process.argv[2];
let count = process.argv[3];

/**
 * notify the user about wrong command line format
 */
function WrongFormat() {
    console.log('@Warning: Wrong Command Format');
    console.log('Please try format: node master.js -f/d/h [number of function tests]. See examples below:');
    console.log('Funtional Test:        node master.js -f 120');
    console.log('Hit Unit Test:         node master.js -h');
    console.log('Direction Unit Test:   node master.js -d');
}

//process command lines.
if (cmd) {
    if (/^\-f$/ig.test(cmd)) { // -f number
        let numberOfTests: number
        if (count) numberOfTests = parseInt(count);
        if (typeof numberOfTests != 'number' || Number.isNaN(numberOfTests)) numberOfTests = 100;
        let options: TestOptions = { key: 'Functional', count: numberOfTests };
        Master.ChildProcesses['tester'].send(JSON.stringify(options));
    } else if (/^\-d$/ig.test(cmd)) {//-d direction unit test
        let options: TestOptions = { key: 'Unit Direction' };
        Master.ChildProcesses['tester'].send(JSON.stringify(options));
    } else if (/^\-h$/ig.test(cmd)) { //-h hit test unit test
        let options: TestOptions = { key: 'Unit HitTest' };
        Master.ChildProcesses['tester'].send(JSON.stringify(options));
    } else {
        WrongFormat();
        process.exit();
    }
}
else {
    WrongFormat();
    process.exit();
}
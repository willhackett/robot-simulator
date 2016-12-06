"use strict";
const child_process = require('child_process');
/**
 * The master controller of child processes
 */
class MasterController {
    constructor() {
        /** the object for child processes*/
        this.ChildProcesses = {};
    }
    get hasAny() {
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
    Fork(key, path) {
        this.ChildProcesses[key] = child_process.fork(path);
        let that = this;
        this.ChildProcesses[key].on("message", (data) => {
            that.Dispatch(data);
        });
    }
    /**
     * Dispatch the data to target child process;
     * @param data
     */
    Dispatch(data) {
        let route = JSON.parse(data);
        if (route.target == '<MASTER>') {
            let directive = route.data;
            switch (directive.directive) {
                case 'kill':
                    if (this.ChildProcesses[directive.name])
                        this.ChildProcesses[directive.name].kill();
                case 'exit':
                    process.exit();
                    break;
            }
            //exit if no child process is alive
            if (!this.hasAny)
                process.exit();
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
    if (/^\-f$/ig.test(cmd)) {
        let numberOfTests;
        if (count)
            numberOfTests = parseInt(count);
        if (typeof numberOfTests != 'number' || Number.isNaN(numberOfTests))
            numberOfTests = 100;
        let options = { key: 'Functional', count: numberOfTests };
        Master.ChildProcesses['tester'].send(JSON.stringify(options));
    }
    else if (/^\-d$/ig.test(cmd)) {
        let options = { key: 'Unit Direction' };
        Master.ChildProcesses['tester'].send(JSON.stringify(options));
    }
    else if (/^\-h$/ig.test(cmd)) {
        let options = { key: 'Unit HitTest' };
        Master.ChildProcesses['tester'].send(JSON.stringify(options));
    }
    else {
        WrongFormat();
        process.exit();
    }
}
else {
    WrongFormat();
    process.exit();
}
//# sourceMappingURL=master.js.map
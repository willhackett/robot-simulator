"use strict";
/**
 * A Logger Class to present the test results in the correct order;
 */
class Logger {
    constructor() {
        this.TesterLogs = [];
        this.RobotLogs = [];
        this.Commands = [];
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
let logger = new Logger();
/**listen to the master process*/
process.on('message', (value) => {
    let data = JSON.parse(value);
    let log = data.data;
    switch (log.source) {
        case 'tester':
            logger.TesterLogs.push(log);
            break;
        case 'robot':
            logger.RobotLogs.push(log);
            break;
        case 'command':
            logger.Commands.push(log);
            break;
        case 'DESIRED':
            logger.desired = log.index;
            break;
    }
    //if all log numbers are equal to the desired number, present them:
    if (logger.desired && logger.TesterLogs.length == logger.desired && logger.RobotLogs.length == logger.desired && logger.Commands.length == logger.desired) {
        logger.TesterLogs.sort((a, b) => Math.sign(a.index - b.index));
        logger.RobotLogs.sort((a, b) => Math.sign(a.index - b.index));
        logger.Commands.sort((a, b) => Math.sign(a.index - b.index));
        for (let i = 0; i < logger.desired; i++) {
            let c = logger.Commands[i];
            let t = logger.TesterLogs[i];
            let r = logger.RobotLogs[i];
            console.log();
            console.log('Command', c.index, c.status);
            if (t.status == r.status) {
                console.log('- TEST ' + i + " is Successful");
                console.log('Tester', t.index, t.status);
                console.log('Robot ', r.index, r.status);
            }
            else {
                console.log('- TEST ' + i + " is Failed");
                console.log('Tester', t.index, t.status);
                console.log('Robot ', r.index, r.status);
            }
        }
        logger.Exit();
    }
});
//# sourceMappingURL=logger.js.map
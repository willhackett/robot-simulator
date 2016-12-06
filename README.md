#Robot Simulator Code Challenge Submission by Zhenyu Shi

##Description:
The project was written in TypeScipt, compiled into JavaScript.

##Architecture
###Robot
The Robot class uses vector and string enum direction with a Table class (implementing IRegion interface) for simple comparison hit test. The robot.js aslo supports child process mode to accept message from parent process for testing.

###Test
Test RobotTester uses complex number and ray caster hit test system. The complex number and ray caster hit test were implemented to demonstrate capability.

###Interfaces
The interfaces are defined in types.ts. 

###Cluster Environment for Test
Since this is a test for Node.JS full stack, the test was written with node cluster. The MasterController in master.ts (which is the main process) will hold the instances of child processes (robot.js, tester.js and logger.js). Because in the cluster environment, the console.log method of child process may not appear in the expected order, so all the test results were sent to logger.js process to present the funtional test results. So the functional test is an implementation of messaging between 4 node processes.
The unit tests should also start from the master.js (see below for usage).

*robot.ts* defines the Robot Class.
*types.ts* defines interfaces consumed by all other files
*util.ts* defines the DirectionUtil Table for Robot to operate its direction and position. It's separated from robot.ts for unit tests.
*master.ts* defines the MasterController for managing child process instances and message routing.
*logger.ts* defines Logger to keep record of funtional test.
*tester.ts* defines RobotTester, Tester, ComplexNumber and Polygon. RobotTester, ComplexNubmer and Polygon has implemented the robot drop move turn logic in a different algorithm from the Robot Class.

##Example Usage:
1) load a file to execute
```CMD
node robot a.txt
```
2) execute commands from command line
```CMD
node robot "DROP 2,2,SOUTH MOVE DROP -2,+3,NORTH LEFT RIGHT REPORT"
```
Tests:
1) Unit Test of Dirction and Turning
```CMD
node master -d
```
2) Unit Test of HitTest
```CMD
node master -h
```
3) Functional Test
```CMD
node master -f 120
```
The code above will generate 120 commands and perform functional test.

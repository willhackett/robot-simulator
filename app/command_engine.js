
var robot = require('./robot')(10, 10);

module.exports.run = function(commands) {

	if(!(typeof commands === 'string' || commands instanceof String)){ return; }

	commands = commands.split(' ');

	var curState = null;

	// loop through each command and run if applicable
	// also catch secondary pram for DROP and parse
	for(var index=0; index<commands.length; index++){
		var cmd = commands[index];
		if(cmd === 'DROP' && index + 1 < commands.length){
			var params = commands[index + 1];
			// parse params
			var matches = params.match(/^(\d+),(\d+),(NORTH|EAST|SOUTH|WEST)$/);			
			if(matches){
				curState = robot.DROP(curState, [+matches[1], +matches[2]], matches[3]);
				index++;
			}			
		}else if(curState && robot[cmd]){
			curState = robot[cmd](curState);
		}
	}
};

var command_engine = require('./app/command_engine');

// check args
if(process.argv.length < 3) {
	console.log('Usage: node ' + process.argv[1] + ' FILENAME');
	process.exit(1);
}

var fs = require('fs'),
	filename = process.argv[2];

fs.readFile(filename, 'utf8', function(err, data) {
	if(err){
		console.error(err);
		throw err;
	}

	command_engine.run(data);
});
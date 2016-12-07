
var expect = require('chai').expect,
	command_engine = require('../app/command_engine');

require('mocha-sinon');

describe('Command Engine', function() {

	beforeEach(function() {
    	this.sinon.stub(console, 'log');
  	});

	it('should ignore non string params', function() {
		command_engine.run(12345);
		command_engine.run([456, 'REPORT']);
		expect(console.log.calledOnce).to.be.false;
	});

	it('should ignore jibberish', function() {
		command_engine.run('saldc sdbc lsadhcb sjchb hlieuhlieu3234938r h348nj');
		expect(console.log.calledOnce).to.be.false;
	});

	it('drop should receive the correct params', function() {
		command_engine.run('DROP 1,1,NORTH REPORT');
		expect(console.log.calledWith('1,1,NORTH')).to.be.true;
	});

	it('drop should be ignored with incorrect params', function() {
		command_engine.run('DROP 1,1,ED DROP 3,3,SOUTH REPORT');
		expect(console.log.calledWith('3,3,SOUTH')).to.be.true;
	});

	it('should output correct result for valid entries', function() {
		command_engine.run('DROP 1,2,EAST MOVE MOVE LEFT MOVE REPORT');
		expect(console.log.calledWith('3,3,NORTH')).to.be.true;
	});

	it('should output correct result for mix of incorrect commands', function() {
		command_engine.run('DROP 1,2,EAST a MOVE 1 MOVE 3 LEFT vf vfdv MOVE jng jng jng REPORT');
		expect(console.log.calledWith('3,3,NORTH')).to.be.true;
	});

	it('should ignore commands until DROP is called', function() {
		command_engine.run('MOVE MOVE REPORT LEFT DROP 1,2,EAST MOVE MOVE LEFT MOVE REPORT');
		expect(console.log.calledWith('3,3,NORTH')).to.be.true;
	});

	it('should allow multiple DROP calls', function() {
		command_engine.run('DROP 1,1,WEST DROP 3,3,SOUTH REPORT');
		expect(console.log.calledWith('3,3,SOUTH')).to.be.true;
	});
});

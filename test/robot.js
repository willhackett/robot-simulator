
var expect = require('chai').expect,
	robot = require('../app/robot')(10, 10);

require('mocha-sinon');

describe('Robot Behaviours', function() {

	function state(x, y, dir) { return { dir, pos: [x,y], }; } 

	describe('Dropping', function() {

		function dropTest(pre, update, ignore = false) {
			var newState = robot.DROP(pre, update.pos, update.dir);
			if(ignore){
				expect(newState).to.deep.equal(pre);
			}else{
				expect(newState).to.deep.equal(update);
			}
		}

		it('should handle valid position state drops', function() {
			dropTest(null, state(5,5,'NORTH'));
			dropTest(state(0,0,'EAST'), state(1,1,'WEST'));
			dropTest(null, state(9,9,'SOUTH'));
			dropTest(null, state(1,2,'EAST'));
		});

		it('should ignore invalid position state drops', function() {
			dropTest(null, state(-1,0,'NORTH'), true);
			dropTest(null, state(0,12,'EAST'), true);
			dropTest(null, state(-1,15,'SOUTH'), true);
			dropTest(null, state(30,20,'NORTH'), true);
		});

	});

	describe('Moving', function() {

		function moveTest(pre, expected){
			expect(robot.MOVE(pre)).to.deep.equal(expected);
		}

		it('should move in the correct directions', function() {
			moveTest(state(0,0,'NORTH'), state(0,1,'NORTH'));
			moveTest(state(0,0,'EAST'), state(1,0,'EAST'));
			moveTest(state(5,4,'WEST'), state(4,4,'WEST'));
			moveTest(state(9,9,'SOUTH'), state(9,8,'SOUTH'));
		});

		it('should ignore an incorrect move', function() {
			moveTest(state(9,9,'NORTH'), state(9,9,'NORTH'));
			moveTest(state(9,0,'SOUTH'), state(9,0,'SOUTH'));
			moveTest(state(9,4,'EAST'), state(9,4,'EAST'));
			moveTest(state(0,3,'WEST'), state(0,3,'WEST'));
		});
	});

	describe('Turning', function() {

		it('should be able to turn left', function() {
			expect(robot.LEFT(state(4,4,'NORTH'))).to.deep.equal(state(4,4,'WEST'));
			expect(robot.LEFT(state(4,4,'SOUTH'))).to.deep.equal(state(4,4,'EAST'));
		});

		it('should be able to turn right', function() {
			expect(robot.RIGHT(state(4,4,'WEST'))).to.deep.equal(state(4,4,'NORTH'));
			expect(robot.RIGHT(state(4,4,'EAST'))).to.deep.equal(state(4,4,'SOUTH'));
		});
	});

	describe('Logging', function() {

		beforeEach(function() {
    		this.sinon.stub(console, 'log');
  		});

		it('should print out the correct REPORT text', function() {
			robot.REPORT(state(5,5,'EAST'));
			expect(console.log.calledWith('5,5,EAST')).to.be.true;
		});
	});

});



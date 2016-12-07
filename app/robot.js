
module.exports = function(dimX, dimY) {

	var BOARD_DIM_X = dimX;
	var BOARD_DIM_Y = dimY;

	// directions in cyclical order
	var order = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

	// check if current robot state is valid
	function validState(state) {
		var x = state.pos[0];
		var y = state.pos[1];

		return x >= 0 && y >= 0 && x < BOARD_DIM_X && y < BOARD_DIM_Y;
	}

	// alter state if given state is valid
	function updateState(curState, pos, dir) {
		var newState = {
			pos,
			dir
		};
		return validState(newState) ? newState : curState;
	};

	return {
		DROP: function(curState, pos, dir) {
			return updateState(curState, pos, dir);
		},

		MOVE: function(curState) {

			const details = {
				NORTH: [0, 1],
				EAST: [1, 0],
				SOUTH: [0, -1],
				WEST: [-1, 0] 
			};

			// do an element wise array sum
			var mod = details[curState.dir];
			var newPos = curState.pos.map((i, pos) => i + mod[pos]);

			return updateState(curState, newPos, curState.dir);
		},

		LEFT: function(curState) {
			var newDir = order.indexOf(curState.dir) - 1;
			if(newDir < 0) { 
				newDir = order.length - 1; 
			}
			return updateState(curState, curState.pos, order[newDir]);
		},

		RIGHT: function(curState) {
			var newDir = order.indexOf(curState.dir) + 1;
			if(newDir >= order.length) { 
				newDir = 0; 
			}
			return updateState(curState, curState.pos, order[newDir]);
		},

		REPORT: function(curState) {
			console.log(curState.pos.join(',') + ',' + curState.dir);
		}
	};
};
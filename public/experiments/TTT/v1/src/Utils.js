export const key = new Map();

key.set('N', 0);
key.set('X', 1);
key.set('O', 2);
key.set(0, 'N');
key.set(1, 'X');
key.set(2, 'O');

export function hashState(arr) {
	let num = 0;
	for (let i = 0; i != 9; i++) {
		num += Math.pow(3, i) * key.get(arr[i]);
	}
	return num;
}

export function genState(num) {
	let state = [];
	while (num > 0) {
		state.push(key.get(num % 3));
		num = (num / 3) | 0;
	}

	for (let i = state.length; i != 9; i++) {
		state.push('N');
	}
	
	return state;
}

function getWinnerRow(index, arr){
	index *= 3;
	if(arr[index] == 'N'){
		return 'N';
	}
	
	for(let i = 0; i != 3; i++){
		if(arr[index] != arr[index + i]){
			return 'N';
		}
	}
	
	return arr[index];
}

function getWinnerCol(index, arr){
	if(arr[index] == 'N'){
		return 'N';
	}
	
	for(let i = 0; i != 3; i++){
		if(arr[index] != arr[index + i * 3]){
			return 'N';
		}
	}
	
	return arr[index];
}

function getWinnerDiag(index, arr){
	index *= 2;
	
	if(arr[index] == 'N'){
		return 'N';
	}
	
	let step = 4 / ((index / 2) + 1);
	
	for(let i = 0; i != 3; i++){
		if(arr[index] != arr[index + i * step]){
			return 'N';
		}
	}
	
	return arr[index];
}

export function getWinner(arr){
	for(let i = 0; i != 3; i++){
		let winner = getWinnerRow(i, arr);
		if(winner != 'N'){
			return winner;
		}
	}
	
	for(let i = 0; i != 3; i++){
		let winner = getWinnerCol(i, arr);
		if(winner != 'N'){
			return winner;
		}
	}
	
	for(let i = 0; i != 2; i++){
		let winner = getWinnerDiag(i, arr);
		if(winner != 'N'){
			return winner;
		}
	}
	
	return 'N';
}

export function getWinnerDetails(arr){
	for(let i = 0; i != 3; i++){
		let winner = getWinnerRow(i, arr);
		if(winner != 'N'){
			return {winner, tiles: [i * 3, i * 3 + 1, i * 3 + 2], orientation: 'row'};
		}
	}
	
	for(let i = 0; i != 3; i++){
		let winner = getWinnerCol(i, arr);
		if(winner != 'N'){
			return {winner, tiles: [i, i + 3, i + 6], orientation: 'col'};
		}
	}
	
	for(let i = 0; i != 2; i++){
		let winner = getWinnerDiag(i, arr);
		if(winner != 'N'){
			let step = 4 / (i + 1);
			return {winner, tiles: [i * 2, i * 2 + step, i * 2 + 2 * step], orientation: 'diag'};
		}
	}
	
	return {winner: 'N', tiles: [], orientation: ''};
}

export function fullBoard(board){
	for(let i = 0; i != 9; i++){
		if(board[i] == 'N'){
			return false;
		}
	}
	return true;
}

export function invertPiece(piece){
	return (piece == 'X') ? 'O' : 'X';
}

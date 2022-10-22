export type Cell = {
	isMine: boolean;
	number: number;
	revealed: boolean;
	x: number;
	y: number;
};

export default function boardGen(
	x: number,
	y: number,
	mines: number,
	clickLoc: [number, number] = [-1, -1]
) {
	let board: Cell[][] = [];

	// generate grid
	for (let i = 0; i < y; i++) {
		let row: Cell[] = [];

		for (let j = 0; j < x; j++) {
			row.push({ isMine: false, number: 0, revealed: false, x: j, y: i });
		}

		board.push(row);
	}

	// place mines
	for (let i = 0; i < mines; i++) {
		let mineX: number, mineY: number;
		let taken = true;

		while (taken) {
			mineX = Math.floor(Math.random() * x);
			mineY = Math.floor(Math.random() * x);

			if (
				!board[mineY][mineX].isMine &&
				mineX !== clickLoc[0] &&
				mineY !== clickLoc[1]
			) {
				taken = false;
				board[mineY][mineX].isMine = true;
			}
		}
	}

	// get numbers
	for (let i = 0; i < y; i++) {
		for (let j = 0; j < x; j++) {
			if (board[i][j].isMine) continue;

			let count = 0;

			// iterate over neighbors
			for (let p = -1; p <= 1; p++) {
				for (let q = -1; q <= 1; q++) {
					// dont count the original cell
					if (p === q && q === 0) continue;

					// out of range / off the board
					if (i + p < 0 || i + p > y - 1 || j + q < 0 || j + q > x - 1)
						continue;

					if (board[i + p][j + q].isMine) count++;
				}
			}

			board[i][j].number = count;
		}
	}
	return board;
}

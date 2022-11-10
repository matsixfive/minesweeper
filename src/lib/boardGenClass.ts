export class Cell {
	#isMine = false;
	#number = 0;
	#revealed = false;
	#flagged = false;
	#x: number;
	#y: number;

	constructor(x: number, y: number) {
		this.#x = x;
		this.#y = y;
	}

	flag() {
		this.#flagged = true;
	}

	unflag() {
		this.#flagged = false;
	}

	reveal() {
		this.#revealed = true;
		this.#flagged = false;
	}

	get coords() {
		return { x: this.#x, y: this.#y };
	}

	get isMine() {
		return this.#isMine;
	}

	get isFlagged() {
		return this.#flagged;
	}

	get isRevealed() {
		return this.#revealed;
	}

	setMine() {
		this.#isMine = true;
	}

	set number(num: number) {
		if (num > 8) num = 8;
		if (num < 0) num = 0;

		this.#number = num;
	}

	get number() {
		return this.#number;
	}
}

new Cell(0, 0);

export default function boardGen(
	width: number,
	height: number,
	mines: number,
	clickLoc: [number, number] = [-1, -1]
) {
	let board: Cell[][] = [];

	// generate grid
	for (let j = 0; j < height; j++) {
		let row: Cell[] = [];

		for (let i = 0; i < width; i++) {
			row.push(new Cell(i, j));
		}

		board.push(row);
	}

	// place mines
	for (let i = 0; i < mines; i++) {
		let mineX: number, mineY: number;
		let taken = true;

		while (taken) {
			mineX = Math.floor(Math.random() * width);
			mineY = Math.floor(Math.random() * height);

			if (
				!board[mineY][mineX].isMine &&
				mineX !== clickLoc[0] &&
				mineY !== clickLoc[1]
			) {
				taken = false;
				board[mineY][mineX].setMine();
			}
		}
	}

	// get numbers
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			if (board[i][j].isMine) continue;

			let count = 0;

			// iterate over neighbors
			for (let p = -1; p <= 1; p++) {
				for (let q = -1; q <= 1; q++) {
					// dont count the original cell
					if (p === q && q === 0) continue;

					// out of range / off the board
					if (i + p < 0 || i + p > height - 1 || j + q < 0 || j + q > width - 1)
						continue;

					if (board[i + p][j + q].isMine) count++;
				}
			}

			board[i][j].number = count;
		}
	}
	return board;
}

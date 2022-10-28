<script lang="ts">
	import FlagIcon from "../FlagIcon.svelte";
	import type { Cell } from "./boardGen";
	import boardGen from "./boardGen";
	import MinesLeft from "./GuiNumber.svelte";

	export let restart: () => void;

	const width = 30;
	const height = 16;
	const mines = 20;

	let boardEl;

	let grid: Cell[][] = boardGen(width, height, 0);
	let lost = false;
	let won = false;

	let flags = 0;
	let nonFlags = width * height;

	let timer = 0;
	let timerInterval: NodeJS.Timer;
	const startTimer = () => {
		timerInterval = setInterval(() => timer++, 1000);
	};

	const stopTimer = () => {
		clearInterval(timerInterval);
	};

	const win = () => {
		won = true;
		// alert("win!");
		stopTimer();
	};

	const lose = () => {
		lost = true;
		// alert("you lose");
		stopTimer();
	};

	const checkForWin = () => {
		if (!won) {
			if (!lost) {
				if (mines - flags === nonFlags) {
					if (nonFlags !== 0) {
						console.log(":)");
						revealRemaining();
					} else {
						win();
					}
				}
			}
		}
	};

	const revealRemaining = () => {
		let flagAmt = 0;
		for (let j = 0; j < height; j++) {
			for (let i = 0; i < width; i++) {
				const { flagged, revealed } = grid[j][i];
				if (!flagged && !revealed) {
					flag(i, j);
					flagAmt++;
				}
			}
		}
		if (flagAmt === 0) {
			win();
		}
		// checkForWin()
	};

	const reveal = (x: number, y: number) => {
		if (!grid[y][x].flagged && !grid[y][x].revealed) {
			grid[y][x].revealed = true;
			nonFlags--;
			if (grid[y][x].isMine) {
				lose();
			}
			checkForWin();
		}
	};

	const flag = (x: number, y: number) => {
		if (!(won || lost)) {
			if (!grid[y][x].flagged) {
				grid[y][x].flagged = true;
				flags++;
				nonFlags--;
			}
			checkForWin();
		}
	};

	const unflag = (x: number, y: number) => {
		if (!(won || lost)) {
		if (grid[y][x].flagged) {
			grid[y][x].flagged = false;
			flags--;
			nonFlags++;
		}
		checkForWin();}
	};

	let clickedYet = false;
	const handleCellClick = (x, y) => {
		if (!lost) {
			if (!clickedYet) {
				grid = boardGen(width, height, mines, [x, y]);
				clickedYet = true;
				startTimer();
			}

			reveal(x, y);

			if (grid[y][x].number !== 0) {
				let numFlags = 0;

				for (let p = -1; p <= 1; p++) {
					for (let q = -1; q <= 1; q++) {
						// dont count the original cell
						if (p === 0 && q === 0) continue;

						// out of range / off the board
						if (
							y + p < 0 ||
							y + p > height - 1 ||
							x + q < 0 ||
							x + q > width - 1
						)
							continue;

						if (grid[y + p][x + q].flagged) {
							numFlags++;
						}
					}
				}

				if (numFlags === grid[y][x].number) {
					for (let p = -1; p <= 1; p++) {
						for (let q = -1; q <= 1; q++) {
							// dont count the original cell
							if (p === 0 && q === 0) continue;

							// out of range / off the board
							if (
								y + p < 0 ||
								y + p > height - 1 ||
								x + q < 0 ||
								x + q > width - 1
							)
								continue;

							if (!grid[y + p][x + q].flagged && !grid[y + p][x + q].revealed) {
								reveal(x + q, y + p);

								if (grid[y + p][x + q].isMine) {
									lose();
								}
							}
						}
					}
				}
			}

			/* loop through all revealed zeroes and
		reveal all adjacent cells until none left */
			console.log("looping");
			while (true) {
				let c = 0;
				for (let j = 0; j < height; j++) {
					for (let i = 0; i < width; i++) {
						if (
							grid[j][i].number === 0 &&
							grid[j][i].revealed &&
							!grid[j][i].isMine
						) {
							for (let q = -1; q <= 1; q++) {
								for (let p = -1; p <= 1; p++) {
									// dont count the original cell
									if (q === 0 && p === 0) continue;

									// out of range / off the board
									if (
										j + q < 0 ||
										j + q > height - 1 ||
										i + p < 0 ||
										i + p > width - 1
									)
										continue;

									if (
										!grid[j + q][i + p].flagged &&
										!grid[j + q][i + p].revealed
									) {
										reveal(i + p, j + q);
										c++;

										if (grid[j + q][i + p].isMine) {
											lose();
										}
									}
								}
							}
						}
					}
				}
				if (c === 0) break;
			}
			console.log("stopped looping");
			checkForWin();
		}
	};
</script>

<section style={`width:${width * 40}px`}>
	<header>
		<h1>
			<MinesLeft number={mines - flags} />
		</h1>
		<button on:click={() => restart()}>{won ? "😎" : lost ? "🙁" : "🙂"}</button
		>
		<h1><MinesLeft number={timer} /></h1>
	</header>
	<!-- <h1><MinesLeft>{flags}</MinesLeft></h1> -->
	<!-- <h1><MinesLeft>{nonFlags}</MinesLeft></h1> -->
	<table on:contextmenu={(e) => e.preventDefault()} bind:this={boardEl}>
		{#each grid as row}
			<tr>
				{#each row as cell}
					{#if cell.revealed}
						<td
							class={"cell revealed".concat(cell.isMine ? " mine" : "")}
							data-value={cell.number}
						>
							{#if cell.isMine}
								<div
									style="display:flex;justify-content:center;align-content:center;"
								>
									<img src="/mine.png" alt="mine" width="25" height="25" />
								</div>
							{:else if cell.number !== 0}
								<button
									class="cell-button"
									on:click={() => {
										if (!cell.flagged) handleCellClick(cell.x, cell.y);
									}}
								>
									<p class="cell-number">
										{cell.number}
									</p></button
								>
							{:else}
								<div class="empty-box" />
							{/if}
						</td>
					{:else}
						<td class={"cell".concat(cell.flagged ? " flagged" : "")}>
							<button
								class="cell-button"
								on:click={() => {
									if (!cell.flagged) handleCellClick(cell.x, cell.y);
								}}
								on:contextmenu={(e) => {
									e.preventDefault();
									if (grid[cell.y][cell.x].flagged) {
										unflag(cell.x, cell.y);
									} else {
										flag(cell.x, cell.y);
									}
								}}
								><div class="cell-inner">
									<!-- <img
										src="/flag.png"
										alt="flag"
										width="25"
										height="25"
										style={`display:${cell.flagged ? "block" : "none"};`}
									/> -->
									<FlagIcon display={cell.flagged} />
								</div></button
							>
						</td>{/if}
				{/each}
			</tr>
		{/each}
	</table>
</section>

<style lang="scss">
	@font-face {
		font-family: "minesweeper";
		src: url("/mine-sweeper.ttf");
	}
	header {
		display: flex;
		justify-content: space-between;
	}
	.empty-box {
		width: 40px;
		height: 40px;
	}
	table {
		border-spacing: 0;
		table-layout: fixed;
	}
	.cell {
		font-size: large;
		overflow: hidden;
		font-family: minesweeper;

		background-color: #bdbdbd;

		.cell-inner {
			box-sizing: content-box;

			width: 25px;
			height: 25px;

			border: 0.5em solid;
			border-color: lightgrey grey grey lightgrey;
		}
		.cell-button {
			color: inherit;
			border: none;
			background: none;
			display: block;

			width: 40px;
			height: 40px;

			font: inherit;
			overflow: hidden;
		}

		&.revealed {
			border: none;
			box-shadow: inset 1px 1px 0 #7b7b7b;
			&.mine {
				background-color: red;
			}
			/* & > .cell-number {
				color: inherit;
				margin: 0;
				text-align: center;

				user-select: none;
				-moz-user-select: none;
				-webkit-user-select: none;
				-ms-user-select: none;
			} */
			&[data-value="1"] {
				color: blue;
			}
			&[data-value="2"] {
				color: green;
			}
			&[data-value="3"] {
				color: red;
			}
			&[data-value="4"] {
				color: darkblue;
			}
			&[data-value="5"] {
				color: darkred;
			}
			&[data-value="6"] {
				color: teal;
			}
			&[data-value="7"] {
				color: black;
			}
			&[data-value="8"] {
				color: gray;
			}
		}
	}
</style>

<script lang="ts">
	import type { Cell } from "./boardGen";
	import boardGen from "./boardGen";
	import MinesLeft from "./GuiNumber.svelte";

	const width = 30;
	const height = 16;
	const mines = 20;

	let lost = false;

	let grid: Cell[][] = boardGen(width, height, 0);

	let flags = 0;

	let clickedYet = false;
	const reveal = (x, y) => {
		if (!lost) {
			if (!clickedYet) {
				grid = boardGen(width, height, mines, [x, y]);
				clickedYet = true;
			}

			grid[y][x].revealed = true;

			if (grid[y][x].isMine) {
				lost = true;
			}

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
								grid[y + p][x + q].revealed = true;

								if (grid[y + p][x + q].isMine) {
									lost = true;
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
				for (let i = 0; i < height; i++) {
					for (let j = 0; j < width; j++) {
						if (
							grid[i][j].number === 0 &&
							grid[i][j].revealed &&
							!grid[i][j].isMine
						) {
							for (let p = -1; p <= 1; p++) {
								for (let q = -1; q <= 1; q++) {
									// dont count the original cell
									if (p === 0 && q === 0) continue;

									// out of range / off the board
									if (
										i + p < 0 ||
										i + p > height - 1 ||
										j + q < 0 ||
										j + q > width - 1
									)
										continue;

									if (
										!grid[i + p][j + q].flagged &&
										!grid[i + p][j + q].revealed
									) {
										grid[i + p][j + q].revealed = true;
										c++;

										if (grid[i + p][j + q].isMine) {
											lost = true;
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

			if (lost) {
				console.log("you lose");
				alert("you lose");
			}
		}
	};

	const flag = (x, y) => {
		if (grid[y][x].flagged) {
			grid[y][x].flagged = false;
			flags--;
		} else {
			grid[y][x].flagged = true;
			flags++;
		}

		if (flags === 0) alert("you win!")
	};
</script>

<article>
	<h1><MinesLeft count={mines - flags} /></h1>
	<table on:contextmenu={(e) => e.preventDefault()}>
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
										if (!cell.flagged) reveal(cell.x, cell.y);
									}}
									on:contextmenu={(e) => {
										e.preventDefault();
										flag(cell.x, cell.y);
									}}
								>
									<p class="cell-number">
										{cell.number}
									</p></button
								>
							{/if}
						</td>
					{:else}
						<td class={"cell".concat(cell.flagged ? " flagged" : "")}>
							<button
								class="cell-button"
								on:click={() => {
									if (!cell.flagged) reveal(cell.x, cell.y);
								}}
								on:contextmenu={(e) => {
									e.preventDefault();
									flag(cell.x, cell.y);
								}}
								><div class="cell-inner">
									<img
										src="/flag.png"
										alt="flag"
										width="25"
										height="25"
										style={`display:${cell.flagged ? "block" : "none"};`}
									/>
								</div></button
							>
						</td>{/if}
				{/each}
			</tr>
		{/each}
	</table>
</article>

<style lang="scss">
	@font-face {
		font-family: "minesweeper";
		src: url("/mine-sweeper.ttf");
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

			border-top: 0.4em solid lightgrey;
			border-bottom: 0.4em solid grey;
			border-left: 0.4em solid lightgrey;
			border-right: 0.4em solid grey;
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
			& > .cell-number {
				color: inherit;
				margin: 0;
				text-align: center;

				user-select: none;
				-moz-user-select: none;
				-webkit-user-select: none;
				-ms-user-select: none;
			}
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

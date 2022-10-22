<script lang="ts">
	import { clear_loops } from "svelte/internal";
	import type { Cell } from "./boardGen";
	import boardGen from "./boardGen";

	const width = 9;
	const height = 9;
	const mines = 10;

	let grid: Cell[][] = boardGen(width, height, mines);

	let clickedYet = false;
	const reveal = (x, y) => {
		if (!clickedYet) {
			grid = boardGen(width, height, mines, [x, y]);
			clickedYet = true;
		}

		grid[y][x].revealed = true;

		if (grid[y][x].number !== 0) return;

		/* loop through all revealed zeroes and
		reveal all adjacent cells until none left */
		console.log("looping");
		while (true) {
			let c = 0;
			for (let i = 0; i < height; i++) {
				for (let j = 0; j < width; j++) {
					if (grid[i][j].number === 0 && grid[i][j].revealed) {
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
								}
							}
						}
					}
				}
			}
			if (c === 0) break;
		}
		console.log("stopped looping");
	};

	const flag = (x, y) => {
		grid[y][x].flagged = !grid[y][x].flagged;
	};
</script>

<article>
	<table>
		{#each grid as row}
			<tr>
				{#each row as cell}
					{#if cell.revealed}
						<td class="cell revealed" data-value={cell.number}>
							<p class="cell-number">
								{#if cell.isMine}
									!
								{:else if cell.number !== 0}
									{cell.number}
								{:else}
									{""}
								{/if}
							</p>
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
							/>
						</td>{/if}
				{/each}
			</tr>
		{/each}
	</table>
</article>

<style lang="scss">
	@font-face {
		font-family: "minesweeper"; /*a name to be used later*/
		src: url("/mine-sweeper.ttf"); /*URL to font*/
	}
	table {
		border-collapse: collapse;
	}
	.cell {
		font-family: minesweeper;
		width: 30px;
		height: 30px;
		border: 2px black solid;
		background-color: gray;
		& > .cell-button {
			color: inherit;
			border: none;
			background: none;
			display: block;
			width: 100%;
			height: 100%;
			font: inherit;
		}
		&.flagged {
			background-color: red;
		}
		&.revealed {
			background-color: lightgray;
			& > .cell-number {
				color: inherit;
				margin: 0;
				text-align: center;
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

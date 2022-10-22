<script lang="ts">
	import type { Cell } from "./boardGen";
	import boardGen from "./boardGen";

	let grid: Cell[][] = boardGen(9, 9, 15);

	let clickedYet = false;
	const reveal = (x, y) => {
		if (!clickedYet) {
			grid = boardGen(9, 9, 15, [x, y]);
			clickedYet = true;
		}

		grid[y][x].revealed = true;

		if (grid[y][x].number !== 0) return;

		/* // iterate over neighbors
		for (let p = -1; p <= 1; p++) {
			for (let q = -1; q <= 1; q++) {
				// dont count the original cell
				if (p === q && q === 0) continue;

				// out of range / off the board
				if (x + p < 0 || x + p > y - 1 || y + q < 0 || y + q > x - 1) continue;
			}
		} */
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
						<td class="cell">
							<button
								class="cell-button"
								on:click={() => reveal(cell.x, cell.y)}
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

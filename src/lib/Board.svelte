<script lang="ts">
	import FlagIcon from "../FlagIcon.svelte";
	import type { Cell } from "./boardGen";
	import boardGen from "./boardGen";
	import MinesLeft from "./GuiNumber.svelte";

	export let restart: () => void;

	export let width = 30;
	export let height= 16;
	export let mines = 99;

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
			checkForWin();
		}
	};

	let clickedYet = false;
	const handleCellClick = (x, y) => {
		if (!lost) {
			if (!clickedYet) {
				clickedYet = true;

				// regenerate board on first click (prevents insta loss)
				grid = boardGen(width, height, mines, [x, y]);

				// start timer on first click
				startTimer();
			}

			// do nothing if cell is flagged
			if (grid[y][x].flagged) {
				console.log("message");
				return;
			}

			// reveal
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

	let mouseDown = false;
</script>

<!-- pre-load font -->
<svelte:head>
	<link
		rel="preload"
		href="/mine-sweeper.ttf"
		as="font"
		crossorigin="anonymous"
	/>
	<link rel="preload" href="/mine.png" as="image" mode="same-origin" />

	{#if lost}
		<link rel="icon" type="image/x-icon" href="/favicon-mine.ico" />{:else}
		<link rel="icon" type="image/x-icon" href="/favicon.ico" />
	{/if}
</svelte:head>

<svelte:body
	on:mousedown={(e) => {
		if (e.button === 0) mouseDown = true;
	}}
	on:mouseup={() => (mouseDown = false)}
/>

<section class="container">
	<div>
		<header class="header">
			<h1>
				<MinesLeft number={mines - flags} />
			</h1>
			<button class="smiley" on:mouseup={() => restart()}
				>{won ? "😎" : lost ? "😵" : "🙂"}</button
			>
			<h1><MinesLeft number={timer} /></h1>
		</header>

		<!-- 
      mousedown: 
     -->
		<table
			class:mouseDown
			class:playing={!(won || lost) && clickedYet}
			on:mousedown={(e) => e.preventDefault()}
			on:contextmenu={(e) => e.preventDefault()}
		>
			<!-- loop through rows of grid -->
			{#each grid as row}
				<tr>
					<!-- loop through cells in each row -->
					{#each row as cell}
						{#if cell.revealed}
							<td
								class={`cell revealed${cell.isMine ? " mine" : ""}`}
								data-number={cell.number}
							>
								{#if cell.isMine}
									<div class="mine-container">
										<img src="/mine.png" alt="mine" width="12" height="12" />
									</div>
								{:else if cell.number !== 0}
									<button
										class="cell-button"
										on:mouseup={(e) => {
											if (e.button === 0) {
												if (!cell.flagged) handleCellClick(cell.x, cell.y);
											}
										}}
									>
										<p class="cell-number">
											{cell.number}
										</p>
									</button>
								{:else}
									<!-- <div class="empty-box" /> -->
									<div class="cell-button">
										<p class="cell-number">{cell.number}</p>
									</div>
								{/if}
							</td>
						{:else}
							<td class={"cell".concat(cell.flagged ? " flagged" : "")}>
								<button
									class="cell-button"
									on:mouseup={(e) => {
										e.preventDefault();

										// left click
										if (e.button === 0) {
											if (!cell.flagged) handleCellClick(cell.x, cell.y);
										}
										// right click
										else if (e.button === 2) {
											// flag / unflag
											if (grid[cell.y][cell.x].flagged) {
												unflag(cell.x, cell.y);
											} else {
												flag(cell.x, cell.y);
											}
										}
									}}
									><div class="cell-inner">
										{#if cell.flagged}
											<div class="flag-container">
												<FlagIcon class="cell-inner" />
											</div>
										{/if}
									</div></button
								>
							</td>{/if}
					{/each}
				</tr>
			{/each}
		</table>
	</div>
</section>

<style lang="scss">
	@font-face {
		font-family: "minesweeper";
		src: url("/mine-sweeper.ttf");
	}

	@mixin border($ratio) {
		$border-tl: #ffffff;
		$border-br: #808080;

		border: calc($border-size * $ratio) solid;
		border-color: $border-tl $border-br $border-br $border-tl;
	}

	$cell-size: 16px;
	$border-size: calc($cell-size * 0.15);

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;

		width: 135px;
		padding: 0.3rem;

		$border-tl: #ffffff;
		$border-br: #808080;

		border: 0.15rem solid;
		border-color: $border-br $border-tl $border-tl $border-br;

		margin: 0.4rem 0.4rem 0 0.4rem;
		.smiley {
			font-size: $cell-size;
			background-color: #c0c0c0;
			border-radius: calc($cell-size / 10);

			// width: calc($cell-size * 1.5);
			// height: calc($cell-size * 1.5);

			// border
			$border-tl: #ffffff;
			$border-br: #808080;

			@include border(1);

			padding: calc($border-size * 0.5);

			&:active {
				border-width: calc($border-size * 0.5) $border-size $border-size
					calc($border-size * 0.5);
				border-color: $border-br;
				padding: calc($border-size * 1.66) 0 0 calc($border-size * 1.66);
			}
		}
	}
	table {
		border-spacing: 0;
		table-layout: fixed;

		$border-tl: #ffffff;
		$border-br: #808080;

		border: calc($border-size * 1.25) solid;
		border-color: $border-br $border-tl $border-tl $border-br;

		margin: 0.4rem 0.4rem 0 0.4rem;

		&.mouseDown.playing .cell:hover:not(.flagged) {
			box-shadow: inset calc($cell-size / 20) calc($cell-size / 20) 0 #808080;
			.cell-inner {
				border-color: transparent;
			}
		}

		.cell {
			font-size: calc($cell-size * 0.666);
			overflow: hidden;
			font-family: "minesweeper";

			background-color: #c0c0c0;

			&.mine {
				background-color: red;
				position: relative;
			}

			.empty-box {
				width: $cell-size;
				height: $cell-size;
			}

			.mine-container {
				left: 50%;
				top: 50%;
				-webkit-transform: translate(-50%, -50%);
				-moz-transform: translate(-50%, -50%);
				transform: translate(-50%, -50%);
				position: absolute;
			}
			.cell-inner {
				@include border(1);

				box-sizing: content-box;

				position: relative;

				width: calc($cell-size - calc($border-size * 2));
				height: calc($cell-size - calc($border-size * 2));

				.flag-container {
					left: 50%;
					top: 50%;
					-webkit-transform: translate(-50%, -50%);
					-moz-transform: translate(-50%, -50%);
					transform: translate(-50%, -50%);
					position: absolute;
				}
			}

			.cell-button {
				color: inherit;
				border: none;
				background: none;
				display: block;

				width: $cell-size;
				height: $cell-size;

				font: inherit;
				overflow: hidden;
				text-align: center;
				align-items: center;
			}

			&.revealed {
				border: none;
				box-shadow: inset calc($cell-size / 20) calc($cell-size / 20) 0 #808080;

				&[data-number="0"] {
					font-size: 0;
				}
				&[data-number="1"] {
					color: blue;
				}
				&[data-number="2"] {
					color: green;
				}
				&[data-number="3"] {
					color: red;
				}
				&[data-number="4"] {
					color: darkblue;
				}
				&[data-number="5"] {
					color: darkred;
				}
				&[data-number="6"] {
					color: teal;
				}
				&[data-number="7"] {
					color: black;
				}
				&[data-number="8"] {
					color: gray;
				}
			}
		}
	}
</style>

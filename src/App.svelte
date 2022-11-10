<script lang="ts">
	// import Board from "./lib/Board.svelte";
	import BoardClass from "./lib/Board.svelte";

	let unique = [{}]; // every {} is unique, {} === {} evaluates to false

	function restart() {
		unique = [{}];
	}
</script>

<main>
	{#each unique as key (key)}
		<BoardClass {restart} />
	{/each}
</main>

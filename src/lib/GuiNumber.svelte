<script lang="ts">
	export let number: number;
</script>

<table>
	<tr>
		{#each number.toString().padStart(3, "0").split("") as char}
			<td>{char}</td>
		{/each}
	</tr>
</table>

<style lang="scss">
	@font-face {
		font-family: "sevensegment";
		src: url("/seven-segment.ttf");
	}

	table {
		// width:100px;
		font-family: "sevensegment";
		color: red;
		table-layout: fixed;
		column-gap: 0;
	}
	td {
		width: 1ch;
		overflow: hidden;
		text-align: center;
	}
</style>

<script lang="ts">
	export let number: number;
</script>

<table>
	<tr>
		{#each number.toString().padStart(3, "0").split("") as char}
			<td><div>{char}</div></td>
		{/each}
	</tr>
</table>

<style lang="scss">
	@font-face {
		font-family: "sevensegment";
		src: url("/digits.ttf");
		// src: url("/7segment.ttf");
	}

	table {
		// width:100px;
		font-family: "sevensegment";
		font-size: 1.4rem;
		color: red;
		table-layout: fixed;
		column-gap: 0;
		border-spacing: 0;
		background-color: black;
	}
	td {
		width: 1ch;
		overflow: hidden;
		text-align: right;

		// position: absolute;
	}
	div {
		position: relative;
		z-index: 0;

		&::after {
			content: "8";
			color:rgb(128, 0, 0);

			left: 0;
			position: absolute;
			z-index: -1;

			mask-position: 0 0;
			mask-size: 2px 2px;
			mask-image: url(../dither.png);
			-webkit-mask-position: 0 0;
			-webkit-mask-size: 2px 2px;
			-webkit-mask-image: url(../dither.png);
			image-rendering: pixelated;
		}
	}
</style>

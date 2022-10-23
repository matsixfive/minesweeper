<script lang="ts">
	export let count = 0;
</script>

<div>{count.toString().padStart(3, "0")}</div>

<style lang="scss">
	@font-face {
		font-family: "sevensegment";
		src: url("/seven-segment.ttf");
	}

	div {
		font-family: "sevensegment";
		color: red;
	}
</style>

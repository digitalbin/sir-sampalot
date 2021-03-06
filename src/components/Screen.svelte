<script>
    import { onMount } from 'svelte';
    import { samplesReady } from '../store';
    export let analyser;

    let canvasParent;
    let bufferLength;
    let dataArray;
    let canvas;
    let canvasCtx;

    const colorScreen = getComputedStyle(document.body).getPropertyValue('--color-screen');
    const colorBars = getComputedStyle(document.body).getPropertyValue('--color-led');
    const rgbColorBars = getComputedStyle(document.body).getPropertyValue('--color-led-rgb');

    function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
      return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
    }

    function barGraph() {
        analyser.getByteFrequencyData(dataArray);
        const width = canvas.width;
        const height = canvas.height;

        const gap = 3;

        const barAmountX = bufferLength;
        const barAmountY = 10;

        const barWidth = (width - gap) / barAmountX;
        const barHeight = (height - gap) / barAmountY;

        for (let i = 0; i <= barAmountX; i++) {
            for(let j = 0; j <= barAmountY; j++) {
                if (scaleBetween(dataArray[i], 0, barAmountY, 0, 255) > j) {
                    canvasCtx.shadowBlur = 2;
                    canvasCtx.shadowColor = colorBars;
                    canvasCtx.fillStyle = `rgba(${rgbColorBars}, ${dataArray[i] / 255})`;
                } else {
                    canvasCtx.shadowBlur = 0;
                    canvasCtx.shadowColor = 'transparent';
                    canvasCtx.fillStyle = 'transparent';
                }

                canvasCtx.fillRect(
                    i * barWidth + gap,
                    height - (j * barHeight),
                    barWidth - gap,
                    barHeight - gap,
                )
            }
        }
    }

    function draw() {
        requestAnimationFrame(draw);
        canvasCtx.fillStyle = colorScreen;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        barGraph();
    }

    function setCanvasSize() {
        const { width, height } = canvasParent.getBoundingClientRect();
        canvas.width  = width;
        canvas.height = height;
    }

    function initCanvas() {
        setCanvasSize();
        canvasCtx = canvas.getContext('2d');
        draw();
    }

    onMount(() => {
        analyser.fftSize = 32;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    });

    $: if (canvas) initCanvas();

</script>

<svelte:window on:resize={setCanvasSize} />

<div class=wrapper>
    <div bind:this={canvasParent} class="canvasParent">
        {#if $samplesReady}
            <canvas bind:this={canvas} id="viz" />
        {:else}
            <div class="loading">
                loading samples
            </div>
        {/if}
    </div>
</div>

<style>
    div.wrapper {
        height: 72px;
        grid-column: 1 / span 4;
        border-radius: var(--radii);
        overflow: hidden;
    }

    div.canvasParent {
        height: 100%;
    }
    div.loading {
        height: 100%;
        font-family: Digital;
        color: var(--color-led);
        background-color: var(--color-screen);
        font-size: 24px;
        text-shadow: 0 0 1px var(--color-led);
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

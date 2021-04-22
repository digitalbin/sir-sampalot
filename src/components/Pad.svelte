<script>
    import { onMount } from 'svelte';

    export let key;
    export let active;
    export let ctx;
    export let connectNode;

    const pathToSample = `/sounds/${key}.wav`;

    let id = key.replace('k-', '');
    let dragging = false;

    let buffer;

    function play(e) {
        active = true;
        if (e && e.cancelable) e.preventDefault();
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        source.connect(connectNode)
        source.start(0);
    };

    function handleDrag(e) {
        const { type } = e;
        dragging = type === 'dragenter';
    };

    function handleDrop(e) {
        dragging = false;
        const reader = new FileReader();
        const [item] = e.dataTransfer.items;
        const file = item.getAsFile();
        reader.onload = (e) => {
            ctx.decodeAudioData(e.target.result, (b) => (buffer = b));
        };
        reader.readAsArrayBuffer(file);
    };

    function deactivate() {
        active = false;
    }

    onMount(async () => {
        const arrayBuffer = await fetch(pathToSample).then((r) =>
            r.arrayBuffer(),
        );
        ctx.decodeAudioData(arrayBuffer, (b) => (buffer = b));
    });

    $: if (active) play();
</script>

<div
    on:touchstart={play}
    on:mousedown={play}
    on:touchend={deactivate}
    on:mouseup={deactivate}
    on:dragenter={handleDrag}
    on:dragleave={handleDrag}
    on:dragover|preventDefault
    on:drop|preventDefault={handleDrop}
    class:dragging
    class:active
>
    {id}
</div>

<style>
    div {
        position: relative;
        background: var(--background-pad);
        display: flex;
        align-items: center;
        justify-content: center;
        color: transparent;
        border-radius: var(--radii);
    }

    @media (min-width: 640px) {
        div {
            color: var(--color-base);
        }
    }

    div.active {
        background: var(--background-pad-active);
    }

    div.dragging:before {
        content: '+';
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 72px;
        color: var(--color-base);
        background: var(--background-pad);
        width: 100%;
        height: 100%;
        position: absolute;
        border-radius: var(--radii);
    }
</style>

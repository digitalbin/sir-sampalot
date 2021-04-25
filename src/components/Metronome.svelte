<script>
    import { onMount } from 'svelte';
    import { bpm, gain } from '../store';
    import Metronome from './Icons/Metronome.svelte';
    import createAudioContext from '../scripts/createAudioContext';
    import getAudioBuffer from '../scripts/getAudioBuffer';

    let min = 0;
    let max = 300;
    let flip = false;
    let isPlaying = false;
    let audioBuffers;

    const ctx = createAudioContext();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    gain.subscribe(value => gainNode.gain.value = value);

    function handleChange(e) {
        let value = parseInt(e.target.value || min, 10);
        value = value < min ? min : value > max ? max : value;
        $bpm = value;
    }

    function playClick(beat) {
        const bufSrc = ctx.createBufferSource();
        bufSrc.buffer = audioBuffers[1 % beat];
        bufSrc.connect(gainNode);
        bufSrc.start(0);
    }

    function handlePlay() {
        isPlaying = !isPlaying;
        let beat = 1;
        const startClick = () => {
            if (isPlaying) {
                playClick(beat);
                beat = beat < 4 ? beat += 1 : 1;
                flip = !flip;
                setTimeout(startClick, 60000 / $bpm);
            } else {
                flip = false;
            }
        }
        startClick();
    }

    onMount(async () => {
        const notes = [
            './sounds/metronome/high.wav',
            './sounds/metronome/low.wav',
        ];
        audioBuffers = await Promise.all(notes.map(src => getAudioBuffer(ctx, src)));
    })
    
</script>

<div class=wrapper>
    <label>
        <input
            type=number
            bind:value={$bpm}
            on:input={handleChange}
        />
        <span>bpm</span>
    </label>
    <button
        on:click={handlePlay}
        class:isPlaying
        aria-label="Toggle metronome"
    >
            <Metronome {flip} />
    </button>
</div>

<style>
    div.wrapper {
        grid-column: 1 /span 2;
        display: flex;
        height: 40px;
    }

    button {
        background-color: var(--color-button);
        border-radius: var(--radii);
        color: var(--color-text);
        padding: 8px;
        width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        outline: none;
    }

    button.isPlaying {
        color: var(--color-led);
    }

    label {
        font-family: Digital;
        color: var(--color-led);
        background-color: var(--color-screen);
        border-radius: var(--radii);
        font-size: 24px;
        padding: 4px 8px 0 8px;
        margin-right: 4px;
        text-shadow: 0 0 1px var(--color-led);
    }

    span {
        font-size: 16px;
    }

    input {
        width: 3ch;
        background-color: transparent;
        outline: none;
        text-align: right;
        text-shadow: 0 0 2px var(--color-led);
    }
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type='number'] {
        -moz-appearance: textfield;
    }

</style>

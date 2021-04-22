<script>
	import { onMount } from 'svelte';
	import Tuna from 'tunajs';
	import {
		gain,
		dist,
		delay,
		reverb,
		bpm,
		handleRotation,
	} from './store';
    import Metronome from './components/Metronome.svelte';
    import Logo from './components/Logo.svelte';
    import Pad from './components/Pad.svelte';
    import Screen from './components/Screen.svelte';
    import Knob from './components/Knob.svelte';
    import createAudioContext from './scripts/createAudioContext';
    import setupConnectChain from './scripts/setupConnectChain';
    import makeDistortionCurve from './scripts/makeDistortionCurve';

	let keyState = {
        'k-q': false,
        'k-w': false,
        'k-e': false,
        'k-r': false,
        'k-a': false,
        'k-s': false,
        'k-d': false,
        'k-f': false,
        'k-z': false,
        'k-x': false,
        'k-c': false,
        'k-v': false,
    };

	const ctx = createAudioContext();
	const tuna = new Tuna(ctx);

	const distNode = ctx.createWaveShaper();
	distNode.curve = makeDistortionCurve($dist * 100);
	distNode.oversample = '4x';

	const delayNode = new tuna.Delay({
		feedback: $delay,
		delayTime: 60000 / $bpm / 4,
		wetLevel: 1,
		dryLevel: 1,
		cutoff: 20000,
		bypass: 0,
	});
	
	const reverbNode = new tuna.Convolver({
		highCut: 22050,
		lowCut: 250,
		dryLevel: 1,
		wetLevel: $reverb,
		level: 1,
		impulse: 'sounds/impulses/big.wav',
		bypass: 0,
	});
	
	const gainNode = new tuna.Gain({ gain: $gain });
	
	const analyser = ctx.createAnalyser();

	const connectNode = setupConnectChain(ctx, [
		distNode,
		delayNode,
		reverbNode,
		gainNode,
		analyser
	]);

	gain.subscribe(value => {gainNode.gain.value = value});
	dist.subscribe(value => distNode.curve = makeDistortionCurve(value * 100));
	delay.subscribe(value => delayNode.feedback = value);
	reverb.subscribe(value => reverbNode.wet.gain.value = value);
	bpm.subscribe(value => delayNode.delayTime.value = (60000 / value / 4) / 1000);

	function handleKey(e) {
        const { key, type } = e;
        if (keyState.hasOwnProperty(`k-${key}`)) {
            keyState = {
                ...keyState,
                [`k-${key}`]: type === 'keydown',
            };
        }
    };

	function resize() {
		const height = window.innerHeight;
		document.documentElement.style.setProperty('--app-height', `${height}px`)
	}

	onMount(() => resize());
</script>

<svelte:window
	on:keydown={handleKey}
	on:keyup={handleKey}
	on:resize={resize}
/>

<div>
	<header>
		<Metronome />
		<Logo />
		<Knob
			title="gain"
			initValue={$gain}
			color="knob-1"
			onChange={handleRotation}
		/>
		<Knob
			title="dist"
			initValue={$dist}
			color="knob-2"
			onChange={handleRotation}
		/>
		<Knob
			title="delay"
			initValue={$delay}
			color="knob-3"
			onChange={handleRotation}
		/>
		<Knob
			title="reverb"
			initValue={$reverb}
			color="knob-4"
			onChange={handleRotation}
		/>
		<Screen {analyser} />
	</header>
	<main>
		{#each Object.entries(keyState) as [key, active]}
			<Pad {key} {active} {ctx} {connectNode} />
		{/each}
	</main>
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		height: var(--app-height);
	}
    header,
    main {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
		grid-gap: 8px;
		padding: 8px;
    }
	main {
		flex: 1;
		padding-top: 0;
	}
</style>

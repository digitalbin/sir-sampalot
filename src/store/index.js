import { writable } from 'svelte/store';

export const gain = writable(0.5);
export const dist = writable(0);
export const delay = writable(0);
export const reverb = writable(0);
export const bpm = writable(92);

const writables = { gain, dist, delay, reverb };

export function handleRotation(e) {
    const { value, title } = e.target;
    const { set } = writables[title];
    set(value);
}
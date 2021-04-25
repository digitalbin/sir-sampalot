import { samplesReady } from '../store';
let loading = 0;
let done = 0;
export default function getAudioBuffer(ctx, path) {
    loading++;
    return fetch(path)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => new Promise(resolve => {
            ctx.decodeAudioData(arrayBuffer, resolve);
            done++;
            if (loading === done) samplesReady.set(true);
        }));
}

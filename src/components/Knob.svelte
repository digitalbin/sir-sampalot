<script>
    import '../scripts/knob-range';

    export let title;
    export let color;
    export let onChange;
    export let initValue;
</script>

<div class="wrapper">
    <span>{title}</span>
    <knob-range
        title={title}
        value={initValue}
        startAngle={-135}
        endAngle={135}
        min={0}
        max={0.75}
        on:rotation={onChange}
        style={`--background-color: var(--color-${color})`}
    ></knob-range>
</div>

<style>
    span {
        margin-top: 8px;
        margin-bottom: 4px;
        line-height: 100%;
    }
    div.wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
        color: var(--color-text);
    }
    knob-range {
        --border-color: var(--color-border);
    }

</style>

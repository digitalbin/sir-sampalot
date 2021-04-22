const defaults = {
    startAngle: 0,
    endAngle: 360,
    min: 0,
    max: 1,
}

const template = document.createElement('template');
template.innerHTML = /* html */ `
    <style>
        :host {
            --initial-direction: 0deg;
            --background-color: #E4E4E4;
            --border-color: #333333;
            --marker-color: var(--border-color);
        }
        div {
            width: 50px;
            height: 50px;
            background-color: var(--background-color);
            border: 2px solid var(--border-color);
            cursor: pointer;
            border-radius: 50%;
            transform: rotate(var(--initial-direction));
        }
        span {
            display: block;
            height: 20%;
            width: 2px;
            background-color: var(--marker-color);
            margin: 0 auto;
        }
    </style>
    <div id="knob" part="knob">
        <span part="marker"></span>
    </div>
`;

function getElementCenter(el) {
    const { left, right, top, bottom } = el.getBoundingClientRect();
    return {
        x: (left + right) / 2,
        y: (top + bottom) / 2,
    }
}

function toValidValue(_value) {
    const value = parseFloat(_value);
    return value < 0 ? value + 360 : value;
}

class KnobRange extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.knob = this.shadowRoot.getElementById('knob');

        this._onInteractionStart = this._onInteractionStart.bind(this);
        this._onInteractionEnd = this._onInteractionEnd.bind(this);

        this._rotate = this._rotate.bind(this);
        this._handleValue = this._handleValue.bind(this);
        this._getCursorPosition = this._getCursorPosition.bind(this);
        this._getDegreesFromCoordinate = this._getDegreesFromCoordinate.bind(this);
    }
    
    _handleValue(degrees) {
        const value = degrees >= this.startAngle
        ? (degrees - this.startAngle) / this.range
        : (degrees + this.endAngle) / this.range;
        
        const isWithinBoundary = value > this.min && value < this.max;
        if (isWithinBoundary) {
            this.value = Math.round((value + Number.EPSILON) * 100) / 100;
        }
    }
    
    _getDegreesFromCoordinate(_x, _y) {
        const elementCenter = getElementCenter(this.knob)
        const x = _x - elementCenter.x;
        const y = _y - elementCenter.y;
        const radians = Math.atan2(y, x) + Math.PI / 2;
        const degrees = (radians * 180 / Math.PI);
        return radians < 0 ? degrees + 360 : degrees;
    }
    
    _getCursorPosition(e) {
        if (e.x && e.y) {
            return { x: e.x, y: e.y };
        } else {
            const [{ clientX: x, clientY: y }] = e.changedTouches;
            return { x, y };
        }
    }
    
    _rotate(e) {
        const { x, y } = this._getCursorPosition(e);
        const degrees = this._getDegreesFromCoordinate(x, y);
        this._handleValue(degrees);
    }
    
    _onInteractionStart(e) {
        if (e.cancelable) e.preventDefault();
        this._rotate(e);
        const { type } = e;
        if (type.includes('touch')) {
            this.addEventListener('touchmove', this._rotate, { passive: true });
            this.addEventListener('touchend', this._onInteractionEnd);
        } else {
            document.addEventListener('mousemove', this._rotate);
            document.addEventListener('mouseup', this._onInteractionEnd);
        }
    }
    
    _onInteractionEnd(e) {
        const { type } = e;
        if (type.includes('touch')) {
            this.removeEventListener('touchmove', this._rotate);
            this.removeEventListener('touchend', this._onInteractionEnd);
        } else {
            document.removeEventListener('mousemove', this._rotate);
            document.removeEventListener('mouseup', this._onInteractionEnd);
        }
    }
    
    connectedCallback() {
        this.range = toValidValue(this.endAngle - this.startAngle);
        this.value = this.value;
        this.addEventListener('touchstart', this._onInteractionStart, { passive: false });
        this.addEventListener('mousedown', this._onInteractionStart);
    }
    
    disconnectedCallback() {
        this.removeEventListener('touchstart', this._onInteractionStart);
        this.removeEventListener('mousedown', this._onInteractionStart);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const degrees = this.startAngle + (this.range * this.value);
        this.knob.style.transform = `rotate(${degrees}deg)`
        
        const evt = new Event('rotation', { bubbles: true });
        this.dispatchEvent(evt);
    }

    static get observedAttributes() {
        return ['value'];
    }

    get value() {
        return parseFloat(this.getAttribute('value'));
    }
    get startAngle() {
        return toValidValue(this.getAttribute('startAngle'));
    }
    get endAngle() {
        return toValidValue(this.getAttribute('endAngle'));
    }
    get min() {
        return parseFloat(this.getAttribute('min'));
    }
    get max() {
        return parseFloat(this.getAttribute('max'));
    }

    set value(newVal) {
        this.setAttribute('value', parseFloat(newVal));
    }
    set startAngle(newVal) {
        this.setAttribute('startAngle', toValidValue(newVal));
    }
    set endAngle(newVal) {
        this.setAttribute('endAngle', toValidValue(newVal));
    }
    set min(newVal) {
        this.setAttribute('min', parseFloat(newVal));
    }
    set max(newVal) {
        this.setAttribute('max', parseFloat(newVal));
    }
}

customElements.define('knob-range', KnobRange);
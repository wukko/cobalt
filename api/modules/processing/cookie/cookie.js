import { strict as assert } from 'node:assert';

export default class Cookie {
    constructor(input) {
        assert(typeof input === 'object');
        this._values = {};
        this.set(input)
    }
    set(values) {
        Object.entries(values).forEach(
            ([ key, value ]) => this._values[key] = value
        )
    }
    unset(keys) {
        for (const key of keys) delete this._values[key]
    }
    static fromString(str) {
        const obj = {};

        str.split('; ').forEach(cookie => {
            const key = cookie.split('=')[0];
            const value = cookie.split('=').splice(1).join('=');
            obj[key] = value
        })

        return new Cookie(obj)
    }
    toString() {
        return Object.entries(this._values).map(([ name, value ]) => `${name}=${value}`).join('; ')
    }
    toJSON() {
        return this.toString()
    }
    values() {
        return Object.freeze({ ...this._values })
    }
}

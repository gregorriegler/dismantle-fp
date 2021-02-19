import { expect } from "chai"

interface Maybe<T> {
}

const NONE: Maybe<any> = {};

function maybe_of<T>(value: T): Maybe<T> {
    return {value}
}

function maybe_value<T>(maybe: Maybe<T>, defaultValue: T): T {
    const asAny = maybe as any;
    if (asAny.value) return asAny.value // can we avoid this if?
    else return defaultValue
}

function maybe_none<T>(): Maybe<T> {
    return NONE
}

function maybe_map<T, U>(maybe: Maybe<T>, f: (a: T) => U): Maybe<U> {
    return maybe_of(f(maybe_value(maybe, undefined)))
}

describe('Maybe', () => {
    it('maybe of a value contains value', () => {
        const result = maybe_of(1)
        expect(maybe_value(result, 2)).to.equal(1)
    })

    it('maybe of none is empty', () => {
        const result = maybe_none()
        expect(maybe_value(result, 2)).to.equal(2)
    })

    it('map over maybe', () => {
        const maybeOne = maybe_of(1)
        const f = (a) => a + 1

        let maybeTwo = maybe_map(maybeOne, f);

        expect(maybe_value(maybeTwo, 3)).to.equal(2)
    })
})

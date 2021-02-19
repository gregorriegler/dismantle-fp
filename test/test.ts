import { expect } from "chai"

interface Maybe<T> {
}

function maybe_of<T>(value: T): Maybe<T> {
    return {value}
}

function maybe_value<T>(maybe: Maybe<T>, defaultValue: T) {
    const asAny = maybe as any;
    if (asAny.value) return asAny.value
    else return defaultValue
}

function maybe_none<T>(): Maybe<T> {
    return {}
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
})

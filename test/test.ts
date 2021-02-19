import {expect} from "chai"

interface Maybe<T> {
}

function maybe_of<T>(value: T) : Maybe<T> {
    return {value}
}

function maybe_value<T>(maybe: Maybe<T>, defaultValue: T) {
    return (maybe as any).value
}

describe('Maybe', () => {
    it('maybe of a value contains value', () => {
        const result = maybe_of(1)
        expect(maybe_value(result, 2)).to.equal(1)
    })
})

import { expect } from "chai"

interface Maybe<T> {
}

interface PrivateMaybe<T> extends Maybe<T> {
    value?: T
}

const NONE: PrivateMaybe<any> = {value: undefined}

function maybe_of<T>(value: T): Maybe<T> {
    return {value}
}

function maybe_value<T>(maybe: Maybe<T>, defaultValue: T): T {
    const privateMaybe = maybe as PrivateMaybe<T>;
    if (privateMaybe.value) return privateMaybe.value // can we avoid this if?
    else return defaultValue
}

function maybe_none<T>(): Maybe<T> {
    return NONE
}

function maybe_map<T, U>(maybe: Maybe<T>, f: (a: T) => U): Maybe<U> {
    let value = maybe_value(maybe, undefined);
    if (value !== undefined) {
        return maybe_of(f(value))
    } else {
        return maybe_none()
    }
}

function maybe_lift<T, U>(f: (a: T) => U): ((a: Maybe<T>) => Maybe<U>) {
    return (a: Maybe<T>) => {
        let value = maybe_value(a, undefined);
        if (value !== undefined) {
            return maybe_of(f(value))
        } else {
            return maybe_none()
        }
    }
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

    it('map over none', () => {
        const f = (a) => {
            throw new Error("should not be called")
        }

        let maybeTwo = maybe_map(maybe_none(), f);

        expect(maybe_value(maybeTwo, 3)).to.equal(3)
    })

    it('lift', () => {
        const f = (a) => a + 1

        let liftedF = maybe_lift(f);

        let maybeTwo = liftedF(maybe_of(1));
        expect(maybe_value(maybeTwo, 3)).to.equal(2)
    })

    it('evaluate a lifted with none', () => {
        const f = (a) => {
            throw new Error("should not be called")
        }

        let liftedF = maybe_lift(f);

        let maybeTwo = liftedF(maybe_none());
        expect(maybe_value(maybeTwo, 3)).to.equal(3)
    })


})

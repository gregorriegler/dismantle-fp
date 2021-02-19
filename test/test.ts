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

function fold<T, U>(maybe: Maybe<T>, some: (a: T) => U, none: () => U): U {
    const privateMaybe = maybe as PrivateMaybe<T>;

    if (privateMaybe.value) {
        return some(privateMaybe.value)
    } else {
        // if we are empty we use the initial value
        return none()
    }
}

function identity<T>(a: T) {
    return a
}

function maybe_value<T>(maybe: Maybe<T>, defaultValue: T): T {
    return fold(maybe, identity, () => defaultValue)
}

function maybe_none<T>(): Maybe<T> {
    return NONE
}

function maybe_map<T, U>(maybe: Maybe<T>, f: (a: T) => U): Maybe<U> {
    return fold(maybe, (a) => maybe_of(f(a)), maybe_none);
}

function maybe_lift<T, U>(f: (a: T) => U): ((a: Maybe<T>) => Maybe<U>) {
    return (a: Maybe<T>) => maybe_map(a, f)
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

import { expect } from "chai"
import { lazy, should_not_call0, should_not_call1 } from "./func"
import { inc } from "./math"
import {
    Maybe,
    maybe_f,
    maybe_flat_map,
    maybe_lift,
    maybe_map,
    maybe_map_unary,
    maybe_none,
    maybe_of,
    maybe_value,
    maybe_value_unary
} from "./maybe"

function expectEmpty(maybe: Maybe<any>) {
    const defaultValue = -1
    expect(maybe_value(maybe, lazy(defaultValue))).to.equal(defaultValue)
}

function expectValue<T>(maybe: Maybe<T>, expected: T) {
    expect(maybe_value(maybe, () => {
        throw new Error("expect value " + expected + ", found none")
    }
    )).to.equal(expected)
}

describe("Maybe (first version)", () => {
    describe("constructor", () => {
        it("of a value contains value", () => {
            const maybe = maybe_of(1)
            expectValue(maybe, 1)
        })

        it("of none is empty", () => {
            const none = maybe_none()
            expectEmpty(none)
        })
    })

    it("unary value", () => {
        const maybe = maybe_of(1)
        expect(maybe_value_unary(maybe)(should_not_call0)).to.equal(1)
    })

    it("unary value of none is empty", () => {
        const none = maybe_none()
        expect(maybe_value_unary(none)(lazy(-1))).to.equal(-1)
    })

    describe("lift and map", () => {
        it("maps over value", () => {
            const maybeOne = maybe_of(1)
            const f = inc

            const maybeTwo = maybe_map(maybeOne, f)

            expectValue(maybeTwo, 2)
        })

        it("maps over none", () => {
            const f = should_not_call1

            const maybeTwo = maybe_map(maybe_none(), f)

            expectEmpty(maybeTwo)
        })

        it("unary maps over value", () => {
            const maybeOne = maybe_of(1)
            const f = inc

            const maybeTwo = maybe_map_unary(maybeOne)(f)

            expectValue(maybeTwo, 2)
        })

        it("unary maps over none", () => {
            const f = should_not_call1

            const maybeTwo = maybe_map_unary(maybe_none())(f)

            expectEmpty(maybeTwo)
        })

        it("evaluates a lifted with value", () => {
            const f = inc

            const liftedF = maybe_lift(f)

            const maybeTwo = liftedF(maybe_of(1))
            expectValue(maybeTwo, 2)
        })

        it("evaluates a lifted with none", () => {
            const liftedF = maybe_lift(should_not_call1)

            const maybeTwo = liftedF(maybe_none())
            expectEmpty(maybeTwo)
        })
    })

    describe("bind and flatMap", () => {
        it("flatMaps over none", () => {
            const maybeTwo = maybe_flat_map(maybe_none(), should_not_call1)

            expectEmpty(maybeTwo)
        })

        it("flatMaps over value", () => {
            const maybeOne = maybe_of(1)
            const f = maybe_f(inc)

            const maybeTwo = maybe_flat_map(maybeOne, f)

            expectValue(maybeTwo, 2)
        })
    })

})

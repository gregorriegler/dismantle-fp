import { expect } from "chai"
import { should_not_call1 } from "./func"
import { expectEmpty, expectValue } from "./maybe_expects"
import { inc } from "./math"
import {
    Maybe, maybe_bind,
    maybe_f,
    maybe_flat_map,
    maybe_is_none,
    maybe_lift,
    maybe_map,
    maybe_none,
    maybe_of
} from "./maybe_union"

describe("Maybe (second version)", () => {
    describe("constructor", () => {
        it("is none", () => {
            const maybe = maybe_none()
            expectEmpty(maybe)
        })

        it("with a value is not none", () => {
            const maybe = maybe_of(1)
            expect(maybe_is_none(maybe)).to.be.false
        })
    })

    it("of a value contains value", () => {
        const maybe = maybe_of(1)
        expectValue(maybe, 1)
    })

    it("of none is empty", () => {
        const none = maybe_none() as Maybe<number>
        expectEmpty(none)
    })

    describe("lift and map", () => {
        it("lifts a func", () => {
            const one = maybe_of(1)

            const lifted = maybe_lift(inc)

            expectValue(lifted(one), 2)
        })

        it("lifted not evaluated with none", () => {
            const none = maybe_none()

            const lifted = maybe_lift(should_not_call1)

            expectEmpty(lifted(none))
        })

        it("maps over value", () => {
            const maybeOne = maybe_of(1)
            const f = inc

            const maybeTwo = maybe_map(maybeOne, f)

            expectValue(maybeTwo, 2)
        })

        it("maps over none", () => {
            const f = should_not_call1

            const maybeTwo: Maybe<any> = maybe_map(maybe_none(), f)

            expectEmpty(maybeTwo)
        })
    })

    describe("bind and flatMap", () => {
        it("binds a func", () => {
            const bound = maybe_bind(maybe_of)

            expectValue(bound(maybe_of(2)), 2)
        })

        it("bound not evaluated with none", () => {
            const bound = maybe_bind(maybe_of)

            expectEmpty(bound(maybe_none()))
        })

        it("flatMaps over none", () => {
            const maybeTwo: Maybe<any> = maybe_flat_map(maybe_none(), should_not_call1)

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

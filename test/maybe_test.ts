import { expect } from "chai"
import { Maybe, maybe_lift, maybe_map, maybe_map_unary, maybe_none, maybe_of, maybe_value, maybe_value_unary } from "./maybe"

function expectEmpty(first: Maybe<number>) {
    expect(maybe_value(first, () => -1)).to.equal(-1)
}

function expectValue<T>(first: Maybe<T>, value: T) {
    expect(maybe_value(first, () => {
        throw new Error("should not be called")
    })).to.equal(value)
}

describe("Maybe", () => {
    it("of a value contains value", () => {
        const result = maybe_of(1)
        expectValue(result, 1)
    })

    it("of none is empty", () => {
        const result = maybe_none()
        expectEmpty(result)
    })

    it("unary value", () => {
        const result = maybe_of(1)
        expect(maybe_value_unary(result)(() => 2)).to.equal(1)
    })

    it("unary value of none is empty", () => {
        const result = maybe_none()
        expect(maybe_value_unary(result)(() => 2)).to.equal(2)
    })

    it("maps over value", () => {
        const maybeOne = maybe_of(1)
        const f = (a: number) => a + 1

        const maybeTwo = maybe_map(maybeOne, f)

        expectValue(maybeTwo, 2)
    })

    it("maps over none", () => {
        const f = (_: any) => {
            throw new Error("should not be called")
        }

        const maybeTwo = maybe_map(maybe_none(), f)

        expectEmpty(maybeTwo)
    })

    it("unary maps over value", () => {
        const maybeOne = maybe_of(1)
        const f = (a: number) => a + 1

        const maybeTwo = maybe_map_unary(maybeOne)(f)

        expectValue(maybeTwo, 2)
    })

    it("unary maps over none", () => {
        const f = (_: any) => {
            throw new Error("should not be called")
        }

        const maybeTwo = maybe_map_unary(maybe_none())(f)

        expectEmpty(maybeTwo)
    })

    it("lifts", () => {
        const f = (a: number) => a + 1

        const liftedF = maybe_lift(f)

        const maybeTwo = liftedF(maybe_of(1))
        expectValue(maybeTwo, 2)
    })

    it("evaluates a lifted with none", () => {
        const f = (_: any) => {
            throw new Error("should not be called")
        }

        const liftedF = maybe_lift(f)

        const maybeTwo = liftedF(maybe_none())
        expectEmpty(maybeTwo)
    })
})

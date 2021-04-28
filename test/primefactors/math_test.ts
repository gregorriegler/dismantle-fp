import { expect } from "chai"
import { it } from "mocha"
import { is_divided, range_supplier, range_supplier_pure } from "./math"
import { expectEmpty, expectValue } from "../maybe_expects"

describe("Math", () => {
    it("isDivided", () => {
        expect(is_divided(4, 2)).to.equal(true)
        expect(is_divided(2, 4)).to.equal(false)
    })

    describe("range", () => {
        it("empty range", () => {
            const range = range_supplier(2, 1)

            expectEmpty(range())
        })

        it("range", () => {
            const range = range_supplier(1, 3)

            expectValue(range(), 1)
            expectValue(range(), 2)
            expectValue(range(), 3)
            expectEmpty(range())
        })
    })

    it("pure range", () => {
        const { supply: supply, context: initialContext } = range_supplier_pure(1, 3)

        const { value: value1, context: context1 } = supply(initialContext)
        expectValue(value1, 1)
        const { value: value2, context: context2 } = supply(context1)
        expectValue(value2, 2)
        const { value: value3, context: context3 } = supply(context2)
        expectValue(value3, 3)
        const { value: value4 } = supply(context3)
        expectEmpty(value4)
    })
})

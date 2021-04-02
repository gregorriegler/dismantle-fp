import { expect } from "chai"
import { it } from "mocha"
import { is_divided, range_supplier } from "./math"
import { expectEmpty, expectValue } from "./maybe_expects"

describe("Math", () => {

    it("isDivided", () => {
        expect(is_divided(4, 2)).to.equal(true)
        expect(is_divided(2, 4)).to.equal(false)
    })

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

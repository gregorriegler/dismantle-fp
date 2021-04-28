import { expect } from "chai"
import { apply1, curry2, curry3, inc, lazy } from "./func"

describe("Func Tools", () => {

    describe("curry", () => {
        it("curry binary", () => {
            const adder = (a: number, b: number) => a + b

            expect(curry2(adder)(1)(2)).to.equal(3)
        })

        it("curry ternary", () => {
            const adder = (a: number, b: number, c: number) => a + b + c

            expect(curry3(adder)(1)(2)(3)).to.equal(6)
        })
    })

    it("apply unary", () => {
        const adder = inc

        expect(apply1(adder, 1)).to.equal(2)
    })

    it("lazy", () => {
        expect(lazy(1)()).to.equal(1)
    })
})

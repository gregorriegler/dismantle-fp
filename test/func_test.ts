import { expect } from "chai"
import { apply1, compose2, compose3, curry2, curry3, inc, lazy } from "./func"

describe("Func Tools (functions)", () => {

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

    it("compose", () => {
        describe("compose2", () => {
            const f = compose2((a: number) => a + 1, (b: number) => b * 2)
            expect(f(1)).to.equal(4)
        })
        describe("compose3", () => {
            const f = compose3((a: number) => a + 1, (b: number) => b * 2, (c: number) => c - 1)
            expect(f(1)).to.equal(3)
        })
    })
})

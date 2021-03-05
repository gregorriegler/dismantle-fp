import { expect } from "chai"
import { compose1, inc, lazy, should_not_call0 } from "./func"
import { Maybe, maybe_none, maybe_of, maybe_value } from "./maybe"
import { seq_first, seq_flat_map, seq_lift, seq_map, seq_of_array, seq_of_empty, seq_of_singleton, seq_of_supplier } from "./seq"

function expectEmpty(maybe: Maybe<number>) {
    const defaultValue = -1
    expect(maybe_value(maybe, lazy(defaultValue))).to.equal(defaultValue)
}

function expectValue<T>(maybe: Maybe<T>, expected: T) {
    expect(maybe_value(maybe, should_not_call0)).to.equal(expected)
}

describe("Seq", () => {
    // TODO flatMap, fold, reduce, forEach

    it("is empty", () => {
        const seq = seq_of_empty()

        const { head: first } = seq_first(seq)

        expectEmpty(first)
    })

    it("with singleton element", () => {
        const seq = seq_of_singleton(1)

        const { head: first, tail } = seq_first(seq)
        const { head: second } = seq_first(tail)

        expectValue(first, 1)
        expectEmpty(second)
    })

    it("with 2 elements", () => {
        const seq = seq_of_array([1, 2])

        const { head: first, tail } = seq_first(seq)
        const { head: second, tail: second_tail } = seq_first(tail)
        const { head: third } = seq_first(second_tail)

        expectValue(first, 1)
        expectValue(second, 2)
        expectEmpty(third)
    })

    it("with supplier function", () => {
        let i = 0
        const seq = seq_of_supplier(() => maybe_of(++i))

        const { head: first, tail } = seq_first(seq)
        const { head: second } = seq_first(tail)

        expectValue(first, 1)
        expectValue(second, 2)
    })

    it("with limited supplier function", () => {
        let i = 10
        const seq = seq_of_supplier(() => i > 10 ? maybe_none : maybe_of(++i))

        const { head: first, tail } = seq_first(seq)
        const { head: second } = seq_first(tail)

        expectValue(first, 11)
        expectEmpty(second)
    })

    it("maps elements", () => {
        const seq = seq_of_singleton(1)

        const mapped = seq_map(seq, inc)

        const { head: first } = seq_first(mapped)
        expectValue(first, 2)
    })

    it("lifts functions", () => {
        const seq = seq_of_singleton(1)

        const lifted = seq_lift(inc)
        const mapped = lifted(seq)

        const { head: first } = seq_first(mapped)
        expectValue(first, 2)
    })

    it("flatMaps and unpacks elements", () => {
        const seq = seq_of_singleton(3)

        const mapped = seq_flat_map(seq, compose1(inc, seq_of_singleton))

        const { head: first } = seq_first(mapped)
        expectValue(first, 4)
    })

    xit("flatMaps and flattens multiple elements", () => {
        const seq = seq_of_singleton(3)

        const mapped = seq_flat_map(seq, (n) => seq_of_array([n + 1, n + 2]))

        const { head: first, tail } = seq_first(mapped)
        const { head: second } = seq_first(tail)

        expectValue(first, 4)
        expectValue(second, 5)
    })

})

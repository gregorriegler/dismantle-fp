import { expect } from "chai"
import { compose1, F1, inc, should_not_call0 } from "./func"
import { Maybe, maybe_is_none, maybe_none, maybe_of, maybe_value } from "./maybe_union"
import {
    Seq,
    seq_first,
    seq_flat_map,
    seq_lift,
    seq_join,
    seq_map,
    seq_of_array,
    seq_of_empty,
    seq_of_singleton,
    seq_of_supplier,
    SeqElement
} from "./seq"

function expectEmpty(maybe: Maybe<any>) {
    expect(maybe_is_none(maybe)).to.be.true
}

function expectValue<T>(maybe: Maybe<T>, expected: T) {
    expect(maybe_value(maybe, should_not_call0)).to.equal(expected)
}

describe("Seq", () => {
    // TODO flatMap, fold, reduce, forEach

    it("is empty", () => {
        const seq = seq_of_empty()

        const {head: first} = seq_first(seq)

        expectEmpty(first)
    })

    it("with singleton element", () => {
        const seq = seq_of_singleton(1)

        const {head: first, tail} = seq_first(seq)
        const {head: second} = seq_first(tail)

        expectValue(first, 1)
        expectEmpty(second)
    })

    it("with 2 elements", () => {
        const seq = seq_of_array([1, 2])

        const {head: first, tail} = seq_first(seq)
        const {head: second, tail: second_tail} = seq_first(tail)
        const {head: third} = seq_first(second_tail)

        expectValue(first, 1)
        expectValue(second, 2)
        expectEmpty(third)
    })

    it("with supplier function", () => {
        let i = 0
        const seq = seq_of_supplier(() => maybe_of(++i))

        const {head: first, tail} = seq_first(seq)
        const {head: second} = seq_first(tail)

        expectValue(first, 1)
        expectValue(second, 2)
    })

    it("with limited supplier function", () => {
        let i = 10
        const seq: Seq<number> = seq_of_supplier(() => i > 10 ? maybe_none() : maybe_of(++i))

        const {head: first, tail} = seq_first(seq)
        const {head: second} = seq_first(tail)

        expectValue(first, 11)
        expectEmpty(second)
    })

    it("maps elements", () => {
        const seq = seq_of_singleton(1)

        const mapped = seq_map(seq, inc)

        const {head: first} = seq_first(mapped)
        expectValue(first, 2)
    })

    it("lifts functions", () => {
        const seq = seq_of_singleton(1)

        const lifted = seq_lift(inc)
        const mapped = lifted(seq)

        const {head: first} = seq_first(mapped)
        expectValue(first, 2)
    })

    it("lifted functions apply to seq with many elements", () => {
        const seq = seq_of_array([1, 2])

        const lifted = seq_lift((a: number) => (a + 1))

        const {head: first, tail} = seq_first(lifted(seq))
        const {head: second} = seq_first(tail)

        expectValue(first, 2)
        expectValue(second, 3)
    })

    it("flatMaps an empty seq", () => {
        const emptySeq = seq_of_empty()

        const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose1(inc, seq_of_singleton)
        const mapped: Seq<number> = seq_flat_map(emptySeq, increaseToSequenceOfNumbers)

        const {head}: SeqElement<number> = seq_first(mapped)
        expectEmpty(head)
    })

    it("flatMaps many elements to empty", () => {
        const seq = seq_of_array([3, 4])
        const makeEmptyList: F1<number, Seq<number>> = (_: number) => seq_of_empty()

        const mapped: Seq<number> = seq_flat_map(seq, makeEmptyList)

        const {head: first, tail} = seq_first(mapped)
        const {head: second} = seq_first(tail)
        expectEmpty(first)
        expectEmpty(second)
    })

    it("flatMaps single element to single element", () => {
        const seq = seq_of_singleton(3)
        const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose1(inc, seq_of_singleton)

        const mapped: Seq<number> = seq_flat_map(seq, increaseToSequenceOfNumbers)

        const {head: first}: SeqElement<number> = seq_first(mapped)
        expectValue(first, 4)
    })

    it("flatMaps many elements to single element", () => {
        const seq = seq_of_array([3, 4])
        const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose1(inc, seq_of_singleton)

        const mapped: Seq<number> = seq_flat_map(seq, increaseToSequenceOfNumbers)

        const {head: first, tail} = seq_first(mapped)
        const {head: second} = seq_first(tail)
        expectValue(first, 4)
        expectValue(second, 5)
    })

    it("flatMaps a single element to many elements", () => {
        const seq = seq_of_singleton(3)
        const nextTwoNumbers: (n: number) => Seq<number> = (n) => seq_of_array([n + 1, n + 2])

        const mapped = seq_flat_map(seq, nextTwoNumbers)

        const {head: first, tail} = seq_first(mapped)
        const {head: second, tail: secondTail} = seq_first(tail)
        const {head: third} = seq_first(secondTail)
        expectValue(first, 4)
        expectValue(second, 5)
        expectEmpty(third)
    })

    // TODO flatMaps many elements to many elements

    // TODO are tests for join missing
    // - empty in middle?
    // - more elements?

    it("joins two empty seqs", () => {
        const seq1 = seq_of_empty()
        const seq2 = seq_of_empty()

        const joined = seq_join(seq1, seq2)

        const {head: first, tail} = seq_first(joined)
        const {head: second} = seq_first(tail)
        expectEmpty(first)
        expectEmpty(second)
    })

    it("joins seq with an empty seq", () => {
        const seq1 = seq_of_singleton(3)
        const seq2 = seq_of_empty()

        const joined = seq_join(seq1, seq2)

        const {head: first, tail} = seq_first(joined)
        const {head: second} = seq_first(tail)
        expectValue(first, 3)
        expectEmpty(second)
    })

    it("joins empty seqs with a value", () => {
        const seq1 = seq_of_empty()
        const seq2 = seq_of_singleton(2)

        const joined = seq_join(seq1, seq2)

        const {head: first, tail} = seq_first(joined)
        const {head: second} = seq_first(tail)
        expectValue(first, 2)
        expectEmpty(second)
    })

})

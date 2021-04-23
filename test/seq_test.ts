import { compose1, F1 } from "./func"
import { expectValue } from "./maybe_expects"
import { inc } from "./math"
import { maybe_none, maybe_of } from "./maybe_union"
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
    seq_of_supplier
} from "./seq"
import {
    expect_seq_empty,
    expect_seq_four_values,
    expect_seq_one_value,
    expect_seq_three_values,
    expect_seq_two_values
} from "./seq_expects"

describe("Seq", () => {
    // TODO fold, reduce, forEach

    it("is empty", () => {
        const seq = seq_of_empty()

        expect_seq_empty(seq)
    })

    it("with singleton element", () => {
        const seq = seq_of_singleton(1)

        expect_seq_one_value(seq, 1)
    })

    it("with 2 elements", () => {
        const seq = seq_of_array([1, 2])

        expect_seq_two_values(seq, 1, 2)
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
        let i = 1
        const seq = seq_of_supplier(() =>
            i >= 3
                ? maybe_none()
                : maybe_of(i++)
        )

        expect_seq_two_values(seq, 1, 2)
    })

    it("with empty supplier function", () => {
        const seq = seq_of_supplier(() => maybe_none())

        expect_seq_empty(seq)
    })

    it("with limited supplier function", () => {
        let i = 10
        const seq: Seq<number> = seq_of_supplier(() => i > 10 ? maybe_none() : maybe_of(++i))

        expect_seq_one_value(seq, 11)
    })

    it("maps elements", () => {
        const seq = seq_of_singleton(1)

        const mapped = seq_map(seq, inc)

        expect_seq_one_value(mapped, 2)
    })

    it("lifts functions", () => {
        const seq = seq_of_singleton(1)

        const lifted = seq_lift(inc)

        const mapped = lifted(seq)
        expect_seq_one_value(mapped, 2)
    })

    it("lifted functions apply to seq with many elements", () => {
        const seq = seq_of_array([1, 2])

        const lifted = seq_lift((a: number) => (a + 1))

        const mapped = lifted(seq)
        expect_seq_two_values(mapped, 2, 3)
    })

    it("flatMaps an empty seq", () => {
        const emptySeq = seq_of_empty()

        const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose1(inc, seq_of_singleton)
        const mapped: Seq<number> = seq_flat_map(emptySeq, increaseToSequenceOfNumbers)

        expect_seq_empty(mapped)
    })

    it("flatMaps many elements to empty", () => {
        const seq = seq_of_array([3, 4])
        const makeEmptyList: F1<number, Seq<number>> = (_: number) => seq_of_empty()

        const mapped: Seq<number> = seq_flat_map(seq, makeEmptyList)

        expect_seq_empty(mapped)
    })

    it("flatMaps single element to single element", () => {
        const seq = seq_of_singleton(3)
        const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose1(inc, seq_of_singleton)

        const mapped: Seq<number> = seq_flat_map(seq, increaseToSequenceOfNumbers)

        expect_seq_one_value(mapped, 4)
    })

    it("flatMaps many elements to single element", () => {
        const seq = seq_of_array([3, 4])
        const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose1(inc, seq_of_singleton)

        const mapped: Seq<number> = seq_flat_map(seq, increaseToSequenceOfNumbers)

        expect_seq_two_values(mapped, 4, 5)
    })

    it("flatMaps a single element to many elements", () => {
        const seq = seq_of_singleton(3)
        const nextTwoNumbers: (n: number) => Seq<number> = (n) => seq_of_array([n + 1, n + 2])

        const mapped = seq_flat_map(seq, nextTwoNumbers)

        expect_seq_two_values(mapped, 4, 5)
    })

    it("flatMaps many elements to many elements", () => {
        const seq = seq_of_array([1, 2])
        const nextTwoNumbers: (n: number) => Seq<number> = (n) => seq_of_array([n + 1, n + 2])

        const mapped = seq_flat_map(seq, nextTwoNumbers)

        expect_seq_four_values(mapped, 2, 3, 3, 4)
    })

    xit("flatMaps many elements to many elements with different mutations in supplier", () => {
        let i = 1
        const seq = seq_of_supplier(() =>
            i >= 3
                ? maybe_none()
                : maybe_of(i++)
        )
        const nextTwoNumbers: (n: number) => Seq<number> = (n) =>
            n == 1
                ? seq_of_singleton(1)
                : seq_of_array([n, n])

        const mapped = seq_flat_map(seq, nextTwoNumbers)

        expect_seq_three_values(mapped, 1, 2, 2)
    })

    // TODO are tests for join missing
    // - empty in middle?
    // - more elements?

    it("joins two empty seqs", () => {
        const seq1 = seq_of_empty()
        const seq2 = seq_of_empty()

        const joined = seq_join(seq1, seq2)

        expect_seq_empty(joined)
    })

    it("joins seq with an empty seq", () => {
        const seq1 = seq_of_singleton(3)
        const seq2 = seq_of_empty()

        const joined = seq_join(seq1, seq2)

        expect_seq_one_value(joined, 3)
    })

    it("joins empty seqs with a value", () => {
        const seq1 = seq_of_empty()
        const seq2 = seq_of_singleton(2)

        const joined = seq_join(seq1, seq2)

        expect_seq_one_value(joined, 2)
    })

})

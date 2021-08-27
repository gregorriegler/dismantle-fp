import { expect } from "chai"
import { add, compose2, F1, inc } from "./func"
import { expectValue } from "./maybe_expects"
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
    seq_of_supplier,
    seq_fold,
    seq_filter
} from "./seq"
import { expect_seq_n_values } from "./seq_expects"

const nextTwoNumbers: (n: number) => Seq<number> = (n) => seq_of_array([n + 1, n + 2])

const BAD_SEQ_1 = {
    head: () => { throw new Error("head was called") },
    tail: () => { throw new Error("tail was called") }
}

const BAD_SEQ_2 = seq_join(seq_of_singleton(1), BAD_SEQ_1)

describe("Seq (Monad)", () => {
    describe("constructor", () => {
        it("is empty", () => {
            const seq = seq_of_empty()

            expect_seq_n_values(seq)
        })

        it("with singleton element", () => {
            const seq = seq_of_singleton(1)

            expect_seq_n_values(seq, 1)
        })

        it("with 2 elements", () => {
            const seq = seq_of_array([1, 2])

            expect_seq_n_values(seq, 1, 2)
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
            const seq: Seq<number> = seq_of_supplier(() =>
                i > 10
                    ? maybe_none()
                    : maybe_of(++i))

            expect_seq_n_values(seq, 11)
        })

        it("with limited supplier function (added but was already there)", () => {
            let i = 1
            const seq = seq_of_supplier(() =>
                i >= 3
                    ? maybe_none()
                    : maybe_of(i++)
            )

            expect_seq_n_values(seq, 1, 2)
        })

        it("with empty supplier function", () => {
            const seq = seq_of_supplier(() => maybe_none())

            expect_seq_n_values(seq)
        })
    })

    describe("lift and map", () => {
        it("maps elements", () => {
            const seq = seq_of_singleton(1)

            const mapped = seq_map(seq, inc)

            expect_seq_n_values(mapped, 2)
        })

        it("lifts functions", () => {
            const seq = seq_of_singleton(1)

            const lifted = seq_lift(inc)

            const mapped = lifted(seq)
            expect_seq_n_values(mapped, 2)
        })

        it("lifted functions apply to seq with many elements", () => {
            const seq = seq_of_array([1, 2])

            const lifted = seq_lift((a: number) => (a + 1))

            const mapped = lifted(seq)
            expect_seq_n_values(mapped, 2, 3)
        })

        it("maps lazy, fail on first element", () => {
            const seq = BAD_SEQ_1
            const mapped = seq_map(seq, inc)

            const act = () => seq_first(mapped)

            expect(act).to.throw("head was called")
        })

        it("maps lazy, fail on second element", () => {
            const seq = BAD_SEQ_2
            const mapped = seq_map(seq, inc)
            const first = seq_first(mapped)
            expectValue(first.head, 2)
            const second = first.tail

            const act = () => seq_first(second)

            expect(act).to.throw("head was called")
        })
    })

    describe("bind and flatMap", () => {
        it("flatMaps an empty seq", () => {
            const emptySeq = seq_of_empty()

            const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose2(inc, seq_of_singleton)
            const mapped: Seq<number> = seq_flat_map(emptySeq, increaseToSequenceOfNumbers)

            expect_seq_n_values(mapped)
        })

        it("flatMaps (all) many elements to empty", () => {
            const seq = seq_of_array([3, 4])
            const makeEmptyList: F1<number, Seq<number>> = (_: number) => seq_of_empty()

            const mapped: Seq<number> = seq_flat_map(seq, makeEmptyList)

            expect_seq_n_values(mapped)
        })

        it("flatMaps single element to single element", () => {
            const seq = seq_of_singleton(3)
            const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose2(inc, seq_of_singleton)

            const mapped: Seq<number> = seq_flat_map(seq, increaseToSequenceOfNumbers)

            expect_seq_n_values(mapped, 4)
        })

        it("flatMaps (all) many elements to single element", () => {
            const seq = seq_of_array([3, 4])
            const increaseToSequenceOfNumbers: F1<number, Seq<number>> = compose2(inc, seq_of_singleton)

            const mapped: Seq<number> = seq_flat_map(seq, increaseToSequenceOfNumbers)

            expect_seq_n_values(mapped, 4, 5)
        })

        it("flatMaps a single element to many elements", () => {
            const seq = seq_of_singleton(3)

            const mapped = seq_flat_map(seq, nextTwoNumbers)

            expect_seq_n_values(mapped, 4, 5)
        })

        it("flatMaps (all) many elements to many elements", () => {
            const seq = seq_of_array([1, 2])

            const mapped = seq_flat_map(seq, nextTwoNumbers)

            expect_seq_n_values(mapped, 2, 3, 3, 4)
        })

        it("flatMaps many elements to single and elements from supplier", () => {
            // redundant after supplier got fixed
            let i = 1
            const seq = seq_of_supplier(() =>
                i >= 3
                    ? maybe_none()
                    : maybe_of(i++)
            )
            const weirdNextTwoNumbers: (n: number) => Seq<number> = (n) =>
                n == 1
                    ? seq_of_singleton(1)
                    : seq_of_array([n, n])

            const mapped = seq_flat_map(seq, weirdNextTwoNumbers)

            expect_seq_n_values(mapped, 1, 2, 2)
        })

        it("flatMaps many elements to empty and non empty (bug from PrimeFactors n=3)", () => {
            const seq = seq_of_array([1, 2])
            function first_empty(p: number) {
                if (p == 2) {
                    return seq_of_singleton(2)
                }
                return seq_of_empty()
            }

            const mapped = seq_flat_map(seq, first_empty)

            expect_seq_n_values(mapped, 2)
        })

        it("flatMaps lazy, fail on first element", () => {
            const seq = BAD_SEQ_1
            const mapped = seq_flat_map(seq, nextTwoNumbers)

            const act = () => seq_first(mapped)

            expect(act).to.throw("head was called")
        })

        it("flatMaps lazy, fail on second mapped = third element", () => {
            const seq = BAD_SEQ_2
            const mapped = seq_flat_map(seq, nextTwoNumbers)
            const first = seq_first(mapped)
            const second = seq_first(first.tail).tail

            const act = () => seq_first(second)

            expect(act).to.throw("head was called")
        })
    })

    describe("join", () => {
        it("joins two empty seq", () => {
            const seq1 = seq_of_empty()
            const seq2 = seq_of_empty()

            const joined = seq_join(seq1, seq2)

            expect_seq_n_values(joined)
        })

        it("joins seq with an empty seq", () => {
            const seq1 = seq_of_singleton(3)
            const seq2 = seq_of_empty()

            const joined = seq_join(seq1, seq2)

            expect_seq_n_values(joined, 3)
        })

        it("joins empty seq with a value", () => {
            const seq1 = seq_of_empty()
            const seq2 = seq_of_singleton(2)

            const joined = seq_join(seq1, seq2)

            expect_seq_n_values(joined, 2)
        })

        it("joins two seq with values", () => {
            const seq1 = seq_of_array([1, 2])
            const seq2 = seq_of_array([3, 4])

            const joined = seq_join(seq1, seq2)

            expect_seq_n_values(joined, 1, 2, 3, 4)
        })

        it("joins lazy, fail on first element", () => {
            const seq1 = BAD_SEQ_1
            const seq2 = BAD_SEQ_1
            const joined = seq_join(seq1, seq2)

            const act = () => seq_first(joined)

            expect(act).to.throw("head was called")
        })
    })

    describe("fold", () => {
        it("folds an empty seq", () => {
            const seq = seq_of_empty()

            const result = seq_fold(seq, add, 0)

            expect(result).to.equal(0)
        })

        it("folds a seq of one element", () => {
            const seq = seq_of_singleton(1)

            const result = seq_fold(seq, add, 2)

            expect(result).to.equal(3)
        })

        it("folds a seq of two elements", () => {
            const seq = seq_of_array([1, 2])

            const result = seq_fold(seq, add, 3)

            expect(result).to.equal(6)
        })
    })

    describe("toString", () => {
        it("renders empty seq", () => {
            const seq = seq_of_empty()

            expect(seq.toString()).to.equal("[]")
        })

        it("renders singleton seq", () => {
            const seq = seq_of_singleton(1)

            expect(seq.toString()).to.equal("1")
        })

        it("renders seq of array", () => {
            const seq = seq_of_array([1, 2, 3])

            expect(seq.toString()).to.equal("1,2,3")
        })

        it("renders seq of supplier", () => {
            let i = 1
            const seq = seq_of_supplier(() =>
                i >= 3
                    ? maybe_none()
                    : maybe_of(i++)
            )

            expect(seq.toString()).to.equal("1,2,_")
        })

        it("renders joined seq", () => {
            let i = 1
            const seq = seq_of_supplier(() =>
                i >= 3
                    ? maybe_none()
                    : maybe_of(i++)
            )
            const joined = seq_join(seq, seq_of_singleton(3))

            expect(joined.toString()).to.equal("1,2,3,[]")
        })
    })

    describe("filter", () => {
        it("filter an empty seq", () => {
            const seq = seq_of_empty()

            const filtered = seq_filter(seq, (_) => false)

            expect_seq_n_values(filtered)
        })

        it("filter drops none", () => {
            const seq = seq_of_array([1, 2])

            const filtered = seq_filter(seq, (_) => true)

            expect_seq_n_values(filtered, 1, 2)
        })

        it("filter drops some", () => {
            const seq = seq_of_array([1, 2, 3, 4])

            const filtered = seq_filter(seq, (i) => i % 2 == 1)

            expect_seq_n_values(filtered, 1, 3)
        })

        it("filter drops all", () => {
            const seq = seq_of_array([1, 2])

            const filtered = seq_filter(seq, (_) => false)

            expect_seq_n_values(filtered)
        })
    })

    // TODO Seq implement reduce, forEach
    // TODO Seq implement length - two cases: finite length, infinite length (Math.infinity)
    // TODO Seq toString max elements in case of infinite seq
})

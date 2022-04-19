import { seq_of_array, seq_of_empty, seq_of_singleton, seq_prepender, seq_remover, seq_to_indexed } from "../seq"
import { expect_seq_n_values } from "../seq_expects"

describe("Seq (Monad) extension", () => {
    describe("remover", () => {
        it("remove from an empty seq", () => {
            const seq = seq_of_empty()

            const removed = seq_remover(0)(seq)

            expect_seq_n_values(removed)
        })
        it("remove from single seq", () => {
            const seq = seq_of_singleton(1)

            const removed = seq_remover(0)(seq)

            expect_seq_n_values(removed)
        })
        it("remove from seq beginning", () => {
            const seq = seq_of_array([1, 2])

            const removed = seq_remover(0)(seq)

            expect_seq_n_values(removed, 2)
        })
        it("remove from seq end", () => {
            const seq = seq_of_array([1, 2])

            const removed = seq_remover(1)(seq)

            expect_seq_n_values(removed, 1)
        })
        it("no remove from single seq", () => {
            const seq = seq_of_singleton(1)

            const removed = seq_remover(1)(seq)

            expect_seq_n_values(removed, 1)
        })
    })
    describe("prepend", () => {
        it("to empty", () => {
            const seq = seq_of_empty()

            const prepended = seq_prepender(1)(seq)

            expect_seq_n_values(prepended, 1)
        })
        it("to seq", () => {
            const seq = seq_of_singleton(2)

            const prepended = seq_prepender(1)(seq)

            expect_seq_n_values(prepended, 1, 2)
        })
    })
    describe("with index", () => {
        it("for empty", () => {
            const seq = seq_of_empty()

            const indexed = seq_to_indexed(seq, 0)

            expect_seq_n_values(indexed)
        })
        it("for seq", () => {
            const seq = seq_of_array([11, 12])

            const indexed = seq_to_indexed(seq, 1)

            expect_seq_n_values(indexed, { index: 1, value: 11 }, { index: 2, value: 12 })
        })
    })
})

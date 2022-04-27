import { expect } from "chai"
import { lazy } from "../func"
import { maybe_map, maybe_value } from "../maybe_union"
import { Seq, seq_filter, seq_first, seq_of_array } from "../seq"

// You must put eight chess queens on an 8×8 chessboard
// such that none of them is able to capture any other
// using the standard chess queen's moves.

/*
 1. Create permutations -> all permutations of 8 queens.
 2. Which ones are not ok?
 */

function filter_valid(queens: Seq<number>): boolean {
    const first = seq_first(queens)
    const first_queen_position = first.head

    const mh = maybe_map(first_queen_position, (initial_position) => {
        const s2 = seq_filter(first.tail, (qzueen_position) => {
            initial_position += 1
            return qzueen_position == initial_position
        })
        const found = seq_first(s2)
        const m2 = maybe_map(found.head, (_) => true)

        return ! maybe_value(m2, lazy(false))
    })
    return maybe_value(mh, lazy(true))
}

describe("Eight Queens", () => {
    describe("by filtering", () => {

        it("checks a sequence of 1", () => {
            const queens = seq_of_array([1])
            const valid = filter_valid(queens)
            expect(valid).to.equal(true)
        })

        it("find lower diagonal 2", () => {
            const queens = seq_of_array([1, 2])
            const valid = filter_valid(queens)
            expect(valid).to.equal(false)
        })

        it("find lower diagonal 3", () => {
            const queens = seq_of_array([1, 99, 3])
            const valid = filter_valid(queens)
            expect(valid).to.equal(false)
        })

    })
})

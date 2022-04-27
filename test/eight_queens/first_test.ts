import { expect } from "chai"
import { lazy } from "../func"
import { maybe_map, maybe_value } from "../maybe_union"
import { Seq, seq_first, seq_of_array } from "../seq"
import { expect_seq_n_values } from "../seq_expects"

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
    const mh = maybe_map(first_queen_position, (position) => valid_diagonal(first.tail, position + 1))
    return maybe_value(mh, lazy(true))
}

function valid_diagonal(seq: Seq<number>, column: number): boolean {
    const next = seq_first(seq)
    const next_queen_position = next.head
    const mh = maybe_map(next_queen_position, (position) => position != column)
    return maybe_value(mh, lazy(true))
}

describe("Eight Queens", () => {
    describe("by filtering", () => {

        it("checks a sequence of 1", () => {
            const queens = seq_of_array([1])
            const valid = filter_valid(queens)
            expect(valid).to.equal(true)
        })

        it("find lower diagonal", () => {
            const queens = seq_of_array([1, 2])
            const valid = filter_valid(queens)
            expect(valid).to.equal(false)
        })

    })
})


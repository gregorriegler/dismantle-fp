import { expect } from "chai"
import { lazy } from "../func"
import { maybe_map, maybe_value } from "../maybe_union"
import { Seq, seq_filter, seq_first, seq_of_array, seq_to_indexed, Indexed } from "../seq"

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

    function not_in_lower_diagonal(first_position: number) {

        function is_in_lower_diagonal({ index, value: position }: Indexed<number>): boolean {
            return position == first_position + index || position == first_position - index
        }

        const remaining_positions = seq_to_indexed(first.tail, 1)
        const positions_in_lower_diagonal = seq_filter(remaining_positions, is_in_lower_diagonal)
        const first_found = seq_first(positions_in_lower_diagonal)
        const has_any_lower_diagonal = maybe_map(first_found.head, (_) => true)
        return !maybe_value(has_any_lower_diagonal, lazy(false))
    }

    const lower_diagonal_valid = maybe_map(first_queen_position, not_in_lower_diagonal)
    return maybe_value(lower_diagonal_valid, lazy(true))
}

describe("Eight Queens", () => {
    describe("by filtering", () => {

        it("checks a sequence of dimension 1", () => {
            const queens = seq_of_array([1])
            const valid = filter_valid(queens)
            expect(valid).to.equal(true)
        })

        it("find lower diagonal in dimension 2", () => {
            const queens = seq_of_array([1, 2])
            const valid = filter_valid(queens)
            expect(valid).to.equal(false)
        })

        it("find lower diagonal in dimension 3", () => {
            const queens = seq_of_array([1, 99, 3])
            const valid = filter_valid(queens)
            expect(valid).to.equal(false)
        })

        it("find upper diagonal in dimension 2", () => {
            const queens = seq_of_array([2, 1])
            const valid = filter_valid(queens)
            expect(valid).to.equal(false)
        })

    })
})

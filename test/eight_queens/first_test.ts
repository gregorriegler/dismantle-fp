import { expect } from "chai"
import { lazy } from "../func"
import { maybe_map, maybe_value } from "../maybe_union"
import { Seq, seq_filter, seq_first, seq_of_array, seq_to_indexed, Indexed, seq_lift2, seq_is_empty, seq_make_fold_by } from "../seq"

// You must put eight chess queens on an 8×8 chessboard
// such that none of them is able to capture any other
// using the standard chess queen's moves.

/*
 1. Create permutations -> all permutations of 8 queens.
 2. Which ones are not ok?
 */

function not_in_first_diagonal(queen_positions: Seq<number>): boolean {
    const first = seq_first(queen_positions)
    const first_queen_position = first.head
    const first_not_diagonal = maybe_map(first_queen_position, not_in_this_diagonal)

    function not_in_this_diagonal(first_position: number) {
        const remaining_positions = seq_to_indexed(first.tail, 1)
        const positions_in_diagonal = seq_filter(remaining_positions, is_in_diagonal)

        function is_in_diagonal({ index, value: position }: Indexed<number>): boolean {
            return position == first_position + index || position == first_position - index
        }

        return seq_is_empty(positions_in_diagonal)
    }

    const empty_is_valid = lazy(true)
    return maybe_value(first_not_diagonal, empty_is_valid)
}

export function are_queens_valid(queens: Seq<number>): boolean {
    const not_in_any_diagonal = seq_lift2(not_in_first_diagonal)
    const has_each_no_diagonal = not_in_any_diagonal(queens)
    const all = seq_make_fold_by<boolean, boolean>((a, b) => a && b)
    const have_all_no_diagonal = all(has_each_no_diagonal, true)
    return have_all_no_diagonal
}

describe("Eight Queens filtering", () => {
    describe("filtering from first element", () => {

        it("checks a sequence of dimension 1", () => {
            const queens = seq_of_array([1])
            const valid = are_queens_valid(queens)
            expect(valid).to.equal(true)
        })

        it("find lower diagonal in dimension 2", () => {
            const queens = seq_of_array([1, 2])
            const valid = are_queens_valid(queens)
            expect(valid).to.equal(false)
        })

        it("find lower diagonal in dimension 3", () => {
            const queens = seq_of_array([1, 99, 3])
            const valid = are_queens_valid(queens)
            expect(valid).to.equal(false)
        })

        it("find upper diagonal in dimension 2", () => {
            const queens = seq_of_array([2, 1])
            const valid = are_queens_valid(queens)
            expect(valid).to.equal(false)
        })

    })

    describe("filtering from second element", () => {
        it("find lower diagonal in dimension 3", () => {
            const queens = seq_of_array([99, 1, 2])
            const valid = are_queens_valid(queens)
            expect(valid).to.equal(false)
        })

    })
})

// TODO (Peter) calculate all queens and compare with Internet.

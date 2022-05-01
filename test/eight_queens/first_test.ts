import { expect } from "chai"
import { lazy } from "../func"
import { maybe_lift, maybe_make_or } from "../maybe_union"
import { Seq, seq_filter, seq_first, seq_of_array, seq_to_indexed, Indexed, seq_reverse_bind, seq_is_empty, seq_make_fold_by } from "../seq"

// You must put eight chess queens on an 8�8 chessboard
// such that none of them is able to capture any other
// using the standard chess queen's moves.

/*
 1. Create permutations -> all permutations of 8 queens.
 2. Which ones are not ok?
 */

 export function are_queens_valid(queen_positions: Seq<number>): boolean {
    const not_in_any_diagonal = seq_reverse_bind(not_in_first_diagonal)
    const has_not_any_diagonal = not_in_any_diagonal(queen_positions)
    const all = seq_make_fold_by<boolean, boolean>((a, b) => a && b)
    const have_all_no_diagonal = all(has_not_any_diagonal, true)
    return have_all_no_diagonal
}

function not_in_first_diagonal(queen_positions: Seq<number>): boolean {
    const first = seq_first(queen_positions)
    const first_queen_position = first.head

    const map_no_queen_in_diagonal = maybe_lift(no_queen_in_this_diagonal)
    const first_queen_has_no_diagonals = map_no_queen_in_diagonal(first_queen_position)

    const empty_is_valid = lazy(true)
    const or_valid = maybe_make_or(empty_is_valid)
    return or_valid(first_queen_has_no_diagonals)

    function no_queen_in_this_diagonal(first_position: number) {
        const remaining_positions = seq_to_indexed(first.tail, 1)
        const positions_in_diagonal = seq_filter(remaining_positions, is_diagonal_to_first)

        function is_diagonal_to_first({ index, value: position }: Indexed<number>): boolean {
            return position == first_position + index || position == first_position - index
        }

        return seq_is_empty(positions_in_diagonal)
    }
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

// describe("Eight Queens", () => {
//     it("all solutions", () => {
//         const queens = seq_of_array([99, 1, 2])
//         const valid = are_queens_valid(queens)
//         expect(valid).to.equal(false)
//     })
// })

// TODO (Peter) calculate all queens and compare with Internet.

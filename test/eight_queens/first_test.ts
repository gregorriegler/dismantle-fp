import { expect } from "chai"
import { Seq, seq_of_array, seq_of_singleton } from "../seq"
import { expect_seq_n_values } from "../seq_expects"

// You must put eight chess queens on an 8×8 chessboard
// such that none of them is able to capture any other
// using the standard chess queen's moves.

/*
 1. Create permutations -> all permutations of 8 queens.
 2. Which ones are not ok?
 */

function filter_valid(queens: Seq<number>): boolean {
    return true
}

describe("Eight Queens", () => {
    describe("by filtering", () => {

        it("checks a sequence of 1", () => {
            const queens = seq_of_array([1])
            const valid = filter_valid(queens)
            expect(valid).to.equal(true)
        })

    })
})


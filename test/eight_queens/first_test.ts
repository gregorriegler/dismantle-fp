import { expect } from "chai"
import { Seq, seq_of_singleton } from "../seq"
import { expect_seq_n_values } from "../seq_expects"

// You must put eight chess queens on an 8×8 chessboard
// such that none of them is able to capture any other
// using the standard chess queen?s moves.

/*
 Decomposition:
 dimension 1: 1 solution
 dimension 2: 0 solution
 dimension 3: 0 solution
 dimension 4: 0 solution
 dimension 5: x.... etc.
              ...x.
              .x...
              ....x
              ..x..

 Brute force
 8^8 = 16.777.216 possible boards  = arrays of 8 numbers 1..8
 */

type Queen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

interface ChessBoard {
    "1": Queen
}

function all_boards(size: number): Seq<ChessBoard> {
    return seq_of_singleton({ "1": 1 })
}

describe("Eight Queens", () => {
    describe("by brute force", () => {

        it("produces all combinations size 1", () => {
            const all_combinations = all_boards(1)
            expect_seq_n_values(all_combinations, { "1": 1 })
        })

    })
})

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

type Positions = 1 | 2

type BoardPart<K extends Positions> = {
    [K: string]: Positions
}
type Board<P extends Positions> =
    P extends 1 ? BoardPart<1> :
    P extends 2 ? BoardPart<1> & BoardPart<2> :
    never

function all_boards<SIZE extends Positions>(size: SIZE): Seq<Board<SIZE>> {
    if (size === 1) {
        return seq_of_singleton({ "1": 1 })
    }
    return seq_of_singleton({ "1": 1 })
}

describe("Eight Queens", () => {
    describe("by brute force", () => {

        it("produces all combinations size 1", () => {
            const all_combinations = all_boards(1)
            expect_seq_n_values(all_combinations, { "1": 1 })
        })

        xit("produces all combinations size 2", () => {
            const all_combinations = all_boards(2)
            expect_seq_n_values(all_combinations,
                { "1": 1, "2": 2 },
                { "1": 2, "2": 1 })
        })

    })
})

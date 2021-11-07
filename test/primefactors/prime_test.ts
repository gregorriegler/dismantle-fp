import { expect } from "chai"
import { is_divided, range_supplier } from "./math"
import {
    Seq,
    seq_fold,
    seq_join,
    seq_of_empty,
    seq_of_singleton,
    seq_of_supplier
} from "../seq"
import { expect_seq_n_values } from "../seq_expects"

interface DividedByFactor {
    factors: Seq<number>,
    remaining: number
}

function divisors_of(n: number, prime: number): DividedByFactor {
    // TODO PrimeFactors (maybe) the divisors_of is not lazy
    if (is_divided(n, prime)) {
        const remaining_factors = divisors_of(n / prime, prime)
        return {
            factors: seq_join(seq_of_singleton(prime), remaining_factors.factors),
            remaining: remaining_factors.remaining
        }
    } else {
        return {
            factors: seq_of_empty(),
            remaining: n
        }
    }
}

/**
 * PrimeFactors kata
 * Constraint: lazy, no mutations, unary functions only, point free.
 */
function prime_factors_generate(n: number): Seq<number> {
    const candidates = seq_of_supplier(range_supplier(2, n))

    function foldingFunction(previous: DividedByFactor, candidate: number): DividedByFactor {
        if(previous.remaining == 1) {
            return {
                remaining: 1,
                factors: previous.factors
            }
        }
        const divisors = divisors_of(previous.remaining, candidate)
        return {
            remaining: divisors.remaining,
            factors: seq_join(previous.factors, divisors.factors)
        }
    }

    const dividedByFactors = seq_fold(candidates, foldingFunction, { remaining: n, factors: seq_of_empty() } as DividedByFactor)
    return dividedByFactors.factors
}

// -------- test ---------

describe("PrimeFactors (application of Seq)", () => {
    describe("divisors_of", () => {
        it("divisors of 4", () => {
            const divisors = divisors_of(4 * 3, 2)
            expect(divisors.remaining).to.equals(3)
            const seq: Seq<number> = divisors.factors
            expect_seq_n_values(seq, 2, 2)
        })
    })

    describe("factors of", () => {
        it("of 1", () => {
            const seq = prime_factors_generate(1)
            expect_seq_n_values(seq)
        })

        it("of 2", () => {
            const seq = prime_factors_generate(2)
            expect_seq_n_values(seq, 2)
        })

        it("debug of 3", () => {
            const n = 3
            const candidates = seq_of_supplier(range_supplier(2, n))
            expect_seq_n_values(candidates, 2, n)

            let divisors = divisors_of(n, 2).factors
            expect_seq_n_values(divisors)
            divisors = divisors_of(n, n).factors
            expect_seq_n_values(divisors, n)

            const seq = prime_factors_generate(n)
            expect_seq_n_values(seq, n)
        })

        it("of 4", () => {
            const seq = prime_factors_generate(4)
            expect_seq_n_values(seq, 2, 2)
        })

        it("of 8", () => {
            const seq = prime_factors_generate(8)
            expect_seq_n_values(seq, 2, 2, 2)
        })

        it("of 9", () => {
            const seq = prime_factors_generate(9)
            expect_seq_n_values(seq, 3, 3)
        })

        it("of multiple", () => {
            const seq = prime_factors_generate(2 * 2 * 11)
            expect_seq_n_values(seq, 2, 2, 11)
        }).timeout(3000)
    })
})

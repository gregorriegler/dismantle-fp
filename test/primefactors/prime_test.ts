import { expect } from "chai"
import { it } from "mocha"
import { is_divided, range_supplier } from "./math"
import { Seq, seq_flat_map, seq_join, seq_of_empty, seq_of_singleton, seq_of_supplier } from "../seq"
import { expect_seq_empty, expect_seq_one_value, expect_seq_three_values, expect_seq_two_values } from "../seq_expects"

interface DividedByFactor {
    factors: Seq<number>,
    remaining: number
}

function divisors_of(n: number, prime: number): DividedByFactor {
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


    let remainder = n
    return seq_flat_map(candidates, p => {
        const divisors = divisors_of(remainder, p)
        remainder = divisors.remaining
        return divisors.factors
    })

    /*
    TODO this has mutation, also the divisors_of is not lazy
    remainder needs to be an input to the next iteration to avoid the mutation
    could solve via fold:

    return seq_fold(candidates, foldingFunction, {remaining: n, factors: seq_of_empty()})

    function foldingFunction(candidate: number, previous: DividedByFactor): DividedByFactor {
        const divisors = divisors_of(previous.remaining, candidate)
        return {
            remaining: divisors.remaining,
            factors: seq_join(previous.factors, divisors.factors)
        }
    }
     */
}

// -------- test ---------

describe("PrimeFactors", () => {
    describe("divisors_of", () => {
        it("divisors of 4", () => {
            const divisors = divisors_of(4 * 3, 2)
            expect(divisors.remaining).to.equals(3)
            const seq: Seq<number> = divisors.factors
            expect_seq_two_values(seq, 2, 2)
        })
    })

    describe("factors of", () => {
        it("of 1", () => {
            const seq = prime_factors_generate(1)
            expect_seq_empty(seq)
        })

        it("of 2", () => {
            const seq = prime_factors_generate(2)
            expect_seq_one_value(seq, 2)
        })

        it("debug of 3", () => {
            const n = 3
            const candidates = seq_of_supplier(range_supplier(2, n))
            expect_seq_two_values(candidates, 2, n)

            let divisors = divisors_of(n, 2).factors
            expect_seq_empty(divisors)
            divisors = divisors_of(n, n).factors
            expect_seq_one_value(divisors, n)

            const seq = prime_factors_generate(n)
            expect_seq_one_value(seq, n)
        })

        it("of 4", () => {
            const seq = prime_factors_generate(4)
            expect_seq_two_values(seq, 2, 2)
        })

        it("of 8", () => {
            const seq = prime_factors_generate(8)
            expect_seq_three_values(seq, 2, 2, 2)
        })

        it("of 9", () => {
            const seq = prime_factors_generate(9)
            expect_seq_two_values(seq, 3, 3)
        })

        it("of multiple", () => {
            const seq = prime_factors_generate(2 * 2 * 11)
            expect_seq_three_values(seq, 2, 2, 11)
        })
    })
})

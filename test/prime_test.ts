import { it } from "mocha"
import { is_divided, range_supplier } from "./math"
import { Seq, seq_flat_map, seq_join, seq_of_empty, seq_of_singleton, seq_of_supplier } from "./seq"
import { expect_seq_empty, expect_seq_one_value, expect_seq_three_values, expect_seq_two_values } from "./seq_expects"

function divisors_of(number: number, prime: number): Seq<number> {
    if (is_divided(number, prime)) {
        const remaining_factors = divisors_of(number / prime, prime)
        return seq_join(seq_of_singleton(prime), remaining_factors)
    } else {
        return seq_of_empty()
    }
}

function prime_factors_generate(n: number): Seq<number> {
    const candidate = seq_of_supplier(range_supplier(2, n))
    return seq_flat_map(candidate, p => {
        return divisors_of(n, p)
    })
}

// -------- test ---------

describe("PrimeFactors", () => {
    describe("divisors_of", () => {
        it("divisors of 4", () => {
            const seq: Seq<number> = divisors_of(4 * 3, 2)
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

            let divisors = divisors_of(n, 2)
            expect_seq_empty(divisors)
            divisors = divisors_of(n, n)
            expect_seq_one_value(divisors, n)

            const seq = prime_factors_generate(n)
            expect_seq_one_value(seq, n)
        })

        xit("of 4", () => {
            const seq = prime_factors_generate(4)
            expect_seq_two_values(seq, 2, 2)
        })

        xit("debug of 4", () => {
            const n = 4
            const candidate = seq_of_supplier(range_supplier(2, 2))
            expect_seq_one_value(candidate, 2)

            const mapped = divisors_of(n, 2)
            expect_seq_two_values(mapped, 2, 2)

            const seq = seq_flat_map(seq_of_singleton(2), p => {
                return mapped
                // return seq_of_array([2, 2])
            })
            expect_seq_two_values(seq, 2, 2)
        })

        xit("of 8", () => {
            const seq = prime_factors_generate(8)
            expect_seq_three_values(seq, 2, 2, 2)
        })

        xit("of multiple", () => {
            // TODO fix it
            const seq = prime_factors_generate(2 * 2 * 11)
            expect_seq_three_values(seq, 2, 2, 11)
        })
    })
})

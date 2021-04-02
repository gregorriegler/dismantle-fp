import { expect } from "chai"
import { it } from "mocha"
import { curry2, F0 } from "./func"
import { expectEmpty, expectValue } from "./maybe_expects"
import { Maybe, maybe_none, maybe_of } from "./maybe_union"
import { Seq, seq_flat_map, seq_join, seq_of_empty, seq_of_singleton, seq_of_supplier } from "./seq"
import { expect_seq_empty, expect_seq_one_value, expect_seq_three_values, expect_seq_two_values } from "./seq_expects"

function is_divided_by(divisor: number, n: number): boolean {
    return n % divisor == 0
}

const is_divided = curry2(is_divided_by)

function range_supplier(from: number, to: number): F0<Maybe<number>> {
    let i = from
    return function () {
        if (i > to) {
            return maybe_none()
        }
        return maybe_of(i++)
    }
}

function divisors_of(number: number, prime: number): Seq<number> {
    if (is_divided_by(prime, number)) {
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

    it("isDivided", () => {
        expect(is_divided(2)(4)).to.equal(true)
        expect(is_divided(4)(2)).to.equal(false)
    })

    it("divisors", () => {
        const seq: Seq<number> = divisors_of(4 * 3, 2)
        expect_seq_two_values(seq, 2, 2)
    })

    it("range", () => {
        const s = range_supplier(1, 3)

        expectValue(s(), 1)
        expectValue(s(), 2)
        expectValue(s(), 3)
        expectEmpty(s())
    })

    it("of 1", () => {
        const seq = prime_factors_generate(1)
        expect_seq_empty(seq)
    })

    it("of 2", () => {
        const seq = prime_factors_generate(2)
        expect_seq_one_value(seq, 2)
    })

    it("of 4", () => {
        const seq = prime_factors_generate(4)
        expect_seq_two_values(seq, 2, 2)
    })

    xit("debug 4", () => {
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

    it("of 8", () => {
        const seq = prime_factors_generate(8)
        expect_seq_three_values(seq, 2, 2, 2)
    })

    xit("of multiple", () => {
        // TODO fix it
        const seq = prime_factors_generate(2 * 2 * 11)
        expect_seq_three_values(seq, 2, 2, 11)
    })

})

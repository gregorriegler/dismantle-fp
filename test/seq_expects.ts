import { expectEmpty, expectValue } from "./maybe_expects"
import { Seq, seq_first } from "./seq"

export function expect_seq_empty(seq: Seq<any>) {
    const { head: first, tail: tail } = seq_first(seq)
    expectEmpty(first)
    // just add another check because of infinite sequence
    const { head: second } = seq_first(tail)
    expectEmpty(second)
}

export function expect_seq_one_value<T>(seq: Seq<T>, a: T) {
    const { head: first, tail: tail } = seq_first(seq)
    expectValue(first, a)
    expect_seq_empty(tail)
}

export function expect_seq_two_values<T>(seq: Seq<T>, a: T, b: T) {
    const { head: first, tail } = seq_first(seq)
    expectValue(first, a)
    expect_seq_one_value(tail, b)
}

export function expect_seq_three_values<T>(seq: Seq<T>, a: T, b: T, c: T) {
    const { head: first, tail } = seq_first(seq)
    expectValue(first, a)
    expect_seq_two_values(tail, b, c)
}

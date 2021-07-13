import { expectEmpty, expectValue } from "./maybe_expects"
import { Seq, seq_first } from "./seq"

export function expect_seq_empty(seq: Seq<any>) {
    const { head: first, tail: tail } = seq_first(seq)
    expectEmpty(first)
    // just add another check because of infinite sequence
    const { head: second } = seq_first(tail)
    expectEmpty(second)
}

export function expect_seq_n_values<T>(seq: Seq<T>, ...values: T[]) {
    const { head: first, tail } = seq_first(seq)
    if (values.length == 0) {
        expect_seq_empty(seq)
    } else {
        expectValue(first, values[0])
        expect_seq_n_values(tail, ...values.slice(1))
    }
}

import { Maybe, maybe_lift, maybe_map, maybe_none, maybe_of, maybe_value } from "./maybe"
import "./func"

import { expect } from "chai"
import { partial2_2 } from "./func"

interface PrivateSeq<T> extends Seq<T> {
    head: () => Maybe<T>
    tail: () => Seq<T>
}

interface Seq<T> {
}

interface SeqElement<T> {
    head: Maybe<T>
    tail: Seq<T>
}

const EMPTY: PrivateSeq<any> = {
    head: maybe_none,
    tail: seq_of_empty
}

function seq_of_empty<T>(): Seq<T> {
    return EMPTY
}

function seq_of_singleton<T>(value: Seq<T>): Seq<T> {
    return {
        head: () => maybe_of(value),
        tail: seq_of_empty
    }
}

function seq_of_array<T>(elements: T[]): Seq<T> {
    if (elements.length == 0) { // complete look ahead
        return seq_of_empty()
    }
    return {
        head: () => maybe_of(elements[0]),
        tail: () => seq_of_array(elements.slice(1))
    }
}

function seq_of_supplier<T>(supplier: () => Maybe<T>): Seq<T> {
    return {
        head: () => supplier(),
        tail: () => seq_of_supplier(supplier) // infinite creation of wrappers :-(
    }
}

function seq_first<T>(seq: Seq<T>): SeqElement<T> {
    const privateSeq = seq as PrivateSeq<T>
    return { head: privateSeq.head(), tail: privateSeq.tail() }
}

function seq_head<T>(seq: Seq<T>): Maybe<T> {
    return seq_first(seq).head
}

function seq_tail<T>(seq: Seq<T>): Seq<T> {
    return seq_first(seq).tail
}

function seq_map<T, U>(seq: Seq<T>, f: (n: T) => U): Seq<U> {
    return {
        head: () => maybe_map(seq_head(seq), f),
        tail: () => seq_map(seq_tail(seq), f)
    }
}

function seq_lift<T, U>(f: (a: T) => U): ((a: Seq<T>) => Seq<U>) {
    return partial2_2(seq_map, f)
}

function seq_flat_map<T, U>(seq: Seq<T>, f: (n: T) => Seq<U>): Seq<U> {
    return {
        head: () => {
            const f_for_maybe = maybe_lift(f)
            const mapped_seq: Maybe<Seq<U>> = f_for_maybe(seq_head(seq))
            // TODO return maybe_flat_map(mapped_seq, seq_head)
            return maybe_map(mapped_seq, seq_head)
        },
        tail: () => seq_flat_map(seq_tail(seq), f)
    }
}

// test

function expectEmpty(first: Maybe<number>) {
    expect(maybe_value(first, () => -1)).to.equal(-1)
}

function expectValue<T>(first: Maybe<T>, value: T) {
    expect(maybe_value(first, () => {
        throw new Error("should not be called")
    })).to.equal(value)
}

describe('Seq', () => {
    // map, flatMap, lift, fold, reduce, tail, forEach

    it('Empty Seq', () => {
        const seq: Seq<number> = seq_of_empty()

        const { head: first } = seq_first(seq)

        expectEmpty(first)
    })

    it('Seq with 1 element', () => {
        const seq: Seq<number> = seq_of_singleton(1)

        const { head: first, tail } = seq_first(seq)
        const { head: second } = seq_first(tail)

        expectValue(first, 1)
        expectEmpty(second)
    })

    it('Seq with 2 elements', () => {
        const seq: Seq<number> = seq_of_array([1, 2])

        const { head: first, tail } = seq_first(seq)
        const { head: second, tail: second_tail } = seq_first(tail)
        const { head: third } = seq_first(second_tail)

        expectValue(first, 1)
        expectValue(second, 2)
        expectEmpty(third)
    })

    it('Seq with supplier function', () => {
        let i = 0;
        const seq: Seq<number> = seq_of_supplier(() => maybe_of(++i))

        const { head: first, tail } = seq_first(seq)
        const { head: second } = seq_first(tail)

        expectValue(first, 1)
        expectValue(second, 2)
    })

    it('Seq with limited supplier function', () => {
        let i = 10;
        const seq: Seq<number> = seq_of_supplier(() => i > 10 ? maybe_none : maybe_of(++i))

        const { head: first, tail } = seq_first(seq)
        const { head: second } = seq_first(tail)

        expectValue(first, 11)
        expectEmpty(second)
    })

    it('map elements', () => {
        const seq: Seq<number> = seq_of_singleton(1)

        const mapped = seq_map(seq, (n) => n + 1)

        const { head: first } = seq_first(mapped)
        expectValue(first, 2)
    })

    it('lift functions', () => {
        const seq: Seq<number> = seq_of_singleton(1)

        const adder = (n: number): number => n + 1
        const lifted = seq_lift(adder)
        const mapped = lifted(seq)

        const { head: first } = seq_first(mapped)
        expectValue(first, 2)
    })

    xit('flatMap unpacks elements', () => {
        const seq: Seq<number> = seq_of_singleton(3)

        const mapped = seq_flat_map(seq, (n) => seq_of_singleton(n + 1))

        const { head: first } = seq_first(mapped)
        expectValue(first, 4)
    })

    xit('flatMap flattens multiple elements', () => {
        const seq: Seq<number> = seq_of_singleton(3)

        const mapped = seq_flat_map(seq, (n) => seq_of_array([n + 1, n + 2]))

        const { head: first, tail } = seq_first(mapped)
        const { head: second } = seq_first(tail)

        expectValue(first, 4)
        expectValue(second, 5)
    })

})

import { Maybe, maybe_none, maybe_of, maybe_value } from "./maybe"
import "./func"

import { expect } from "chai"

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

/*
function seq_head<T>(seq: Seq<T>): Maybe<T> {
    return seq_first(seq).head
}

function seq_tail<T>(seq: Seq<T>): Seq<T> {
    return seq_first(seq).tail
}
*/

// test

function expectEmpty(first: Maybe<number>) {
    expect(maybe_value(first, () => -1)).to.equal(-1)
}

function expectValue(first: Maybe<number>, value: number) {
    expect(maybe_value(first, () => -1)).to.equal(value)
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

})

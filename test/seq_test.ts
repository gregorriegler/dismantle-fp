import { expect } from "chai"
import { Maybe, maybe_none, maybe_of, maybe_value } from "./maybe"

import "./func"

interface PrivateSeq<T> extends Seq<T> {
    next: () => Maybe<T>
    remainder: () => Seq<T>
}

interface Seq<T> {
}

function seq_empty<T>(): Seq<T> {
    return {
        next: () => maybe_none(),
        remainder: seq_empty
    };
}

function seq_singleton<T>(value: Seq<T>): Seq<T> {
    return {
        next: () => maybe_of(value),
        remainder: seq_empty
    };
}

function seq_of<T>(elements: T[]): Seq<T> {
    if (elements.length == 0) {
        return seq_empty()
    }
    return {
        next: () => maybe_of(elements[0]),
        remainder: () => seq_of(elements.slice(1))
    }
}

function seq_first<T>(seq: Seq<T>): { first: Maybe<T>, remainder: Seq<T> } { // todo use Pair<T,U>
    const privateSeq = seq as PrivateSeq<T>;
    return { first: privateSeq.next(), remainder: privateSeq.remainder() }
}

function expectEmpty(first: Maybe<number>) {
    expect(maybe_value(first, () => -1)).to.equal(-1)
}

function expectValue(first: Maybe<number>, value: number) {
    expect(maybe_value(first, () => -1)).to.equal(value)
}

describe('Seq', () => {
    // empty, of, getNext, map, flatMap, lift, fold, reduce, head, tail, forEach

    it('Empty Seq', () => {
        const seq: Seq<number> = seq_empty()

        const { first } = seq_first(seq);

        expectEmpty(first);
    })

    it('Seq with 1 element', () => {
        const seq: Seq<number> = seq_singleton(1)

        const { first, remainder } = seq_first(seq);
        const { first: second } = seq_first(remainder);

        expectValue(first, 1);
        expectEmpty(second)
    })

    it('Seq with 2 elements', () => {
        const seq: Seq<number> = seq_of([1, 2])

        const { first, remainder } = seq_first(seq);
        const { first: second, remainder: second_remainder } = seq_first(remainder);
        const { first: third } = seq_first(second_remainder);

        expectValue(first, 1);
        expectValue(second, 2);
        expectEmpty(third);
    })

    // seq_of(generator_func <- gibt immer maybe zurück, am ende maybe_none)
    // seq_from
})

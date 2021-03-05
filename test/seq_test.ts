import { expect } from "chai"
import { Maybe, maybe_none, maybe_value } from "./maybe"

import "./func"

const EMPTY: PrivateSeq<any> = { value: [] }

interface PrivateSeq<T> extends Seq<T> {
    value: T[]
}

interface Seq<T> {
}

function seq_empty() {
    return EMPTY;
}

function seq_first<T>(seq: Seq<T>) {
    return maybe_none()
}

describe('Seq', () => {
    // empty, of, getNext, map, flatMap, lift, fold, reduce, head, tail, forEach

    it('Empty Seq', () => {
        const seq: Seq<number> = seq_empty()

        let first = seq_first(seq);

        expect(maybe_value(first, () => 2)).to.equal(2)
    })
})

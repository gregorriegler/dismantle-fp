import { Maybe, maybe_lift, maybe_map, maybe_none, maybe_of } from "./maybe"
import { F0, F1, partial2_2 } from "./func"

interface PrivateSeq<T> extends Seq<T> {
    head: () => Maybe<T>
    tail: () => Seq<T>
}

export interface Seq<T> {
}

export interface SeqElement<T> {
    head: Maybe<T>
    tail: Seq<T>
}

const EMPTY: PrivateSeq<any> = {
    head: maybe_none,
    tail: seq_of_empty
}

export function seq_of_empty<T>(): Seq<T> {
    return EMPTY
}

export function seq_of_singleton<T>(value: T): Seq<T> {
    return {
        head: () => maybe_of(value),
        tail: seq_of_empty
    }
}

export function seq_of_array<T>(elements: T[]): Seq<T> {
    if (elements.length == 0) { // complete look ahead
        return seq_of_empty()
    }
    return {
        head: () => maybe_of(elements[0]),
        tail: () => seq_of_array(elements.slice(1))
    }
}

export function seq_of_supplier<T>(supplier: F0<Maybe<T>>): Seq<T> {
    return {
        head: supplier,
        tail: () => seq_of_supplier(supplier) // infinite creation of wrappers :-(
    }
}

export function seq_first<T>(seq: Seq<T>): SeqElement<T> {
    const privateSeq = seq as PrivateSeq<T>
    return { head: privateSeq.head(), tail: privateSeq.tail() }
}

function seq_head<T>(seq: Seq<T>): Maybe<T> {
    return seq_first(seq).head
}

function seq_tail<T>(seq: Seq<T>): Seq<T> {
    return seq_first(seq).tail
}

export function seq_map<T, U>(seq: Seq<T>, f: F1<T, U>): Seq<U> {
    return {
        head: () => maybe_map(seq_head(seq), f),
        tail: () => seq_map(seq_tail(seq), f)
    }
}

export function seq_lift<T, U>(f: F1<T, U>): F1<Seq<T>, Seq<U>> {
    return partial2_2(seq_map, f)
}

export function seq_flat_map<T, U>(seq: Seq<T>, f: F1<T, Seq<U>>): Seq<U> {
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

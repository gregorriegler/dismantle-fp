import { Maybe, maybe_bind, maybe_is_none, maybe_lift, maybe_none, maybe_of, maybe_value } from "./maybe_union"
import { F0, F1 } from "./func"

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

export function seq_of_supplier<R>(supplier: F0<Maybe<R>>): Seq<R> {
    // TODO problem: if head is not called, tail is wrong
    const s = supplier(); // eager evaluated
    return {
        head: () => s,
        tail: () => seq_of_supplier(supplier) // infinite creation of wrappers :-(
    }
}

export function seq_first<T>(seq: Seq<T>): SeqElement<T> {
    const privateSeq = seq as PrivateSeq<T>
    return { head: privateSeq.head(), tail: privateSeq.tail() }
}

export function seq_map<T, R>(seq: Seq<T>, f: F1<T, R>): Seq<R> {
    return seq_lift(f)(seq)
}

export function seq_lift<T, R>(f: F1<T, R>): F1<Seq<T>, Seq<R>> {
    return (seq): Seq<R> => {
        return {
            head: () => maybe_lift(f)(seq_head(seq)),
            tail: () => seq_lift(f)(seq_tail(seq))
        }
    }
}

export function seq_flat_map<T, R>(seq: Seq<T>, f: F1<T, Seq<R>>): Seq<R> {
    return seq_bind(f)(seq)
}

export function seq_bind<T, R>(f: F1<T, Seq<R>>): F1<Seq<T>, Seq<R>> {
    return (seq): Seq<R> => {
        // TODO gemeinsame Function rausziehen
        return {
            head: (): Maybe<R> => {
                const evaluated_head: Maybe<Seq<R>> = maybe_lift(f)(seq_head(seq))
                return maybe_bind(seq_head)(evaluated_head)
            },
            tail: (): Seq<R> => {
                const evaluated_head: Maybe<Seq<R>> = maybe_lift(f)(seq_head(seq))
                const tail_of_head: Maybe<Seq<R>> = maybe_lift(seq_tail)(evaluated_head)
                const tail_of_head_or_empty: Seq<R> = maybe_value(tail_of_head, seq_of_empty)
                const evaluated_tail: Seq<R> = seq_bind(f)(seq_tail(seq));
                return seq_join(tail_of_head_or_empty, evaluated_tail);
            }
        }
    }
}

export function seq_is_empty<T>(seq: Seq<T>): boolean {
    return maybe_is_none(seq_head(seq));
}

export function seq_join<T>(first: Seq<T>, second: Seq<T>): Seq<T> {
    return {
        head: () => {
            if (!seq_is_empty(first)) {
                return seq_head(first)
            } else {
                return seq_head(second)
            }
        },
        tail: () => {
            if (!seq_is_empty(first)) {
                return seq_join(seq_tail(first), second)
            } else {
                return seq_tail(second)
            }
        }
    }
}

function seq_head<T>(seq: Seq<T>): Maybe<T> {
    return seq_first(seq).head
}

function seq_tail<T>(seq: Seq<T>): Seq<T> {
    return seq_first(seq).tail
}

import { Maybe, maybe_bind, maybe_lift, maybe_none, maybe_of } from "./maybe_union"
import { F0, F1} from "./func"

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
    return {
        head: supplier,
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
        const lifted_f: F1<Maybe<T>, Maybe<Seq<R>>> = maybe_lift(f);
        const bound_head: F1<Maybe<Seq<T>>, Maybe<T>> = maybe_bind(seq_head);
        return {
            head: (): Maybe<Seq<R>> => bound_head(lifted_f(seq_head(seq))),
            tail: () => seq_bind(f)(seq_tail(seq))
        }
    }
}

function seq_head<T>(seq: Seq<T>): Maybe<T> {
    return seq_first(seq).head
}

function seq_tail<T>(seq: Seq<T>): Seq<T> {
    return seq_first(seq).tail
}
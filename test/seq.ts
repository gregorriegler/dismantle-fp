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

interface CachedValueSeq<V, R> extends PrivateSeq<R> {
    value: V | undefined,
    getValue: () => V
}

export function seq_of_supplier<R>(supplier: F0<Maybe<R>>): Seq<R> {
    return {
        value: undefined,
        getValue: function (): Maybe<R> {
            if (this.value) {
                return this.value
            }
            this.value = supplier()
            return this.value
        },
        head: function () {
            return this.getValue()
        },
        tail: function () {
            const value: Maybe<R> = this.getValue()
            if (maybe_is_none(value)) {
                return EMPTY
            }
            return seq_of_supplier(supplier)
        }
    } as CachedValueSeq<Maybe<R>, R>
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

interface BindSeq<T, R> extends CachedValueSeq<Maybe<Seq<R>>, R> {
    currentSeq: Seq<T>
}

export function seq_bind<T, R>(f: F1<T, Seq<R>>): F1<Seq<T>, Seq<R>> {
    return (seq): Seq<R> => {
        // TODO gemeinsame Function rausziehen
        // TODO umschreiben auf Functions only ("point free", nur compose)
        return {
            currentSeq: seq,
            value: undefined,
            getValue: function () {
                if (this.value == undefined) {
                    const head = seq_head(this.currentSeq)
                    if (maybe_is_none(head)) {
                        // finished
                        this.value = maybe_none()
                        return this.value
                    }

                    const evaluatedHead = maybe_lift(f)(head)
                    if (seq_is_empty(maybe_value(evaluatedHead, seq_of_empty))) {
                        this.currentSeq = seq_tail(this.currentSeq)
                        return this.getValue()
                    }

                    this.value = evaluatedHead
                }
                return this.value
            },
            head: function (): Maybe<R> {
                return maybe_bind(seq_head)(this.getValue())
            },
            tail: function (): Seq<R> {
                const tail_of_head: Maybe<Seq<R>> = maybe_lift(seq_tail)(this.getValue())
                const tail_of_head_or_empty: Seq<R> = maybe_value(tail_of_head, seq_of_empty)
                const evaluated_tail: Seq<R> = seq_bind(f)(seq_tail(this.currentSeq))
                return seq_join(tail_of_head_or_empty, evaluated_tail)
            }
        } as BindSeq<T, R>
    }
}

export function seq_is_empty<T>(seq: Seq<T>): boolean {
    return maybe_is_none(seq_head(seq))
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

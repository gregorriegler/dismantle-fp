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

interface SuppliedSeq<R> extends PrivateSeq<R> {
    supplied: Maybe<R> | undefined,
    supplyOnce: () => Maybe<R>
}

export function seq_of_supplier<R>(supplier: F0<Maybe<R>>): Seq<R> {
    return {
        supplied: undefined,
        supplyOnce: function(): Maybe<R> {
            if (this.supplied) {
                return this.supplied;
            }
            this.supplied = supplier();
            return this.supplied;
        },
        head: function() {
            return this.supplyOnce()
        },
        tail: function() {
            const value: Maybe<R> = this.supplyOnce()
            if (maybe_is_none(value)) {
                return EMPTY
            }
            return seq_of_supplier(supplier)
        }
    } as SuppliedSeq<R>
}

export function seq_first<T>(seq: Seq<T>): SeqElement<T> {
    const privateSeq = seq as PrivateSeq<T>
    return {head: privateSeq.head(), tail: privateSeq.tail()}
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

// TODO duplicate interface with seq_supplier
interface BindSeq<R> extends PrivateSeq<R> {
    cachedEvaluatedHead: Maybe<Seq<R>> | undefined,
    evaluatedHead: () => Maybe<Seq<R>>
}

export function seq_bind<T, R>(f: F1<T, Seq<R>>): F1<Seq<T>, Seq<R>> {
    return (seq): Seq<R> => {
        // TODO gemeinsame Function rausziehen
        return {
            cachedEvaluatedHead: undefined,
            evaluatedHead: function() {
                if (this.cachedEvaluatedHead == undefined) {
                    const x = seq_head(seq);
                    this.cachedEvaluatedHead = maybe_lift(f)(x)
                    if (!maybe_is_none(x) && maybe_is_none(this.cachedEvaluatedHead)) {
                        const foo = this.tail()
                        const y = seq_head(foo)
                        this.cachedEvaluatedHead = y
                    }
                }
                return this.cachedEvaluatedHead
            },
            head: function (): Maybe<R> {
                return maybe_bind(seq_head)(this.evaluatedHead())
            },
            tail: function (): Seq<R> {
                const tail_of_head: Maybe<Seq<R>> = maybe_lift(seq_tail)(this.evaluatedHead())
                const tail_of_head_or_empty: Seq<R> = maybe_value(tail_of_head, seq_of_empty)
                const evaluated_tail: Seq<R> = seq_bind(f)(seq_tail(seq));
                return seq_join(tail_of_head_or_empty, evaluated_tail);
            }
        } as BindSeq<R>
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

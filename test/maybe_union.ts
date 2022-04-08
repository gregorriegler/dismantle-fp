import { compose2, F0, F1, identity1 } from "./func"

const NONE: None<never> = {
    hint: "None",
    toString: () => "_"
}

interface Value<T> extends Object {
    readonly value: T
    readonly hint: "Value"
}

interface None<T> extends Object {
    readonly hint: "None"
}

/**
 * Second version of Maybe.
 * Using `lift` and `bind` for `map` and `flatMap`.
 */
export type Maybe<T> = Value<T> | None<T>

export function maybe_none<T>(): Maybe<T> {
    return NONE
}

export function maybe_is_none<T>(value: Maybe<T>): value is None<T> {
    return value.hint === "None"
}

export function maybe_of_nullable<T>(value: T | undefined | null): Maybe<T> {
    return value ? maybe_of(value) : maybe_none()
}

export function maybe_of<T>(value: T): Maybe<T> {
    return {value: value, hint: "Value", toString: () => value + ""}
}

export function maybe_f<T, R>(f: F1<T, R>): F1<T, Maybe<R>> {
    return compose2(f, maybe_of)
}

export function maybe_value<T>(maybe: Maybe<T>, default_value: F0<T>): T {
    if (!maybe_is_none(maybe)) {
        return (maybe as Value<T>).value;
    } else {
        return default_value();
    }
}

export function maybe_map<T, R>(maybe: Maybe<T>, f: F1<T, R>): Maybe<R> {
    return maybe_lift(f)(maybe)
}

export function maybe_map_i<T, R>(maybe: Maybe<T>): F1<F1<T, R>, Maybe<R>> {
    return f => maybe_lift(f)(maybe)
}

export type MaybeF1<T, R> = F1<Maybe<T>, Maybe<R>>

export function maybe_lift<T, R>(f: F1<T, R>): MaybeF1<T, R> {
    return maybe => maybe_is_none(maybe) ? NONE : maybe_of(f(maybe.value))
}

export function maybe_flat_map<T, R>(maybe: Maybe<T>, f: F1<T, Maybe<R>>): Maybe<R> {
    return maybe_bind(f)(maybe)
}

export function maybe_bind<T, R>(f: F1<T, Maybe<R>>): MaybeF1<T, R> {
    return maybe => maybe_is_none(maybe) ? NONE : f(maybe.value)
}

export function maybe_fold<T, R>(maybe: Maybe<T>, combine: F1<T, R>, initial: F0<R>): R {
    return maybe_value(maybe_lift(combine)(maybe), initial);
}

// maybe_fold(combine, initial)(maybe)
export function maybe_foo<T, R>(combine: F1<T, R>, initial: F0<R>): F1<Maybe<T>, R> {
    return (maybe: Maybe<T>) : R => {
        if (!maybe_is_none(maybe)) {
            return combine((maybe as Value<T>).value);
        } else {
            return initial();
        }
    }
}


export function maybe_fold2<T, R>(maybe: Maybe<T>, some: F1<T, R>, none: F0<R>): R {
    if (!maybe_is_none(maybe)) {
        return some((maybe as Value<T>).value);
    } else {
        return none();
    }
}

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

export function maybe_of<T>(value: T): Maybe<T> {
    return {value: value, hint: "Value", toString: () => value + ""}
}

export function maybe_f<T, R>(f: F1<T, R>): F1<T, Maybe<R>> {
    return compose2(f, maybe_of)
}

export function maybe_value<T>(maybe: Maybe<T>, defaultValue: F0<T>): T {
    return maybe_fold(maybe, identity1, defaultValue)
}

export function maybe_map<T, R>(maybe: Maybe<T>, f: F1<T, R>): Maybe<R> {
    return maybe_lift(f)(maybe)
}

export function maybe_lift<T, R>(f: F1<T, R>): F1<Maybe<T>, Maybe<R>> {
    return maybe => maybe_is_none(maybe) ? NONE : maybe_of(f(maybe.value))
}

export function maybe_flat_map<T, R>(maybe: Maybe<T>, f: F1<T, Maybe<R>>): Maybe<R> {
    return maybe_bind(f)(maybe)
}

export function maybe_bind<T, R>(f: F1<T, Maybe<R>>): F1<Maybe<T>, Maybe<R>> {
    return maybe => maybe_is_none(maybe) ? NONE : f(maybe.value)
}

export function maybe_fold<T, R>(maybe: Maybe<T>, some: F1<T, R>, none: F0<R>): R {
    return maybe_fold1<T, R>(maybe)(some, none)
}

function maybe_fold1<T, R>(maybe: Maybe<T>): (some: F1<T, R>, none: F0<R>) => R {
    return (some: F1<T, R>, none: F0<R>) => !maybe_is_none(maybe) ? some((maybe as Value<T>).value) : none()
}

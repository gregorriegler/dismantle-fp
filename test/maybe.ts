import { compose1, F0, F1, identity1, partial2_1, partial2_2 } from "./func"

const NONE: PrivateMaybe<any> = { value: undefined, toString: () => "_" }

/**
 * First version of Maybe following outline of Tony.
 * Using `fold` for `map` and `flatMap`.
 * Not using `lift` or `bind`.
 */
export interface Maybe<T> extends Object {
}

interface PrivateMaybe<T> extends Maybe<T> {
    value?: T
}

export function maybe_none<T>(): Maybe<T> {
    return NONE
}

export function maybe_of<T>(value: T): Maybe<T> {
    return { value, toString: () => value + '' } as PrivateMaybe<T>
}

export function maybe_f<T, R>(f: F1<T, R>): F1<T, Maybe<R>> {
    return compose1(f, maybe_of)
}

export function maybe_value<T>(maybe: Maybe<T>, defaultValue: F0<T>): T {
    return maybe_fold(maybe, identity1, defaultValue)
}

export function maybe_value_unary<T>(maybe: Maybe<T>): F1<F0<T>, T> {
    return partial2_1(maybe_fold1(maybe), identity1)
}

function maybe_what_is_this<T>(maybe: Maybe<T>, defaultValue: F0<T>): F1<F1<T, T>, T> {
    // maybe start of fold with given start value
    return partial2_2(maybe_fold1(maybe), defaultValue)
}

export function maybe_map<T, R>(maybe: Maybe<T>, f: F1<T, R>): Maybe<R> {
    return maybe_fold(maybe, maybe_f(f), maybe_none)
}

export function maybe_map_unary<T, R>(maybe: Maybe<T>): F1<F1<T, R>, Maybe<R>> {
    return partial2_1(maybe_map, maybe)
    // return (f: F1<T, U>) => maybe_fold(maybe, maybe_f(f), maybe_none)
}

export function maybe_lift<T, R>(f: F1<T, R>): F1<Maybe<T>, Maybe<R>> {
    return partial2_2(maybe_map, f)
    // return (maybe: Maybe<T>) => maybe_fold(maybe, maybe_f(f), maybe_none)
}

export function maybe_flat_map<T, R>(maybe: Maybe<T>, f: F1<T, Maybe<R>>): Maybe<R> {
    // could be implemented by using bind(f) which would return a F1<Maybe<T>, Maybe<R>>
    // then we could bind(f)(maybe)
    return maybe_fold(maybe, f, maybe_none)
}

export function maybe_flat_map_unary<T, R>(maybe: Maybe<T>): F1<F1<T, Maybe<R>>, Maybe<R>> {
    return partial2_1(maybe_flat_map, maybe)
}

// TODO bind is missing
// export function maybe_bind<T, R>(f: F1<T, Maybe<R>>): F1<Maybe<T>, Maybe<R>> {
// }

export function maybe_fold<T, R>(maybe: Maybe<T>, some: F1<T, R>, none: F0<R>): R {
    return maybe_fold1<T, R>(maybe)(some, none)
}

function maybe_fold1<T, R>(maybe: Maybe<T>): (some: F1<T, R>, none: F0<R>) => R {
    const privateMaybe = maybe as PrivateMaybe<T>
    return (some: F1<T, R>, none: F0<R>) => privateMaybe.value ? some(privateMaybe.value) : none()
}
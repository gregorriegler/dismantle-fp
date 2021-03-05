import { F0, F1, identity1, partial2_1, partial2_2 } from "./func"

const NONE: PrivateMaybe<any> = { value: undefined }

export interface Maybe<T> {
}

export function maybe_of<T>(value: T): Maybe<T> {
    return { value }
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

export function maybe_none<T>(): Maybe<T> {
    return NONE
}

export function maybe_map<T, U>(maybe: Maybe<T>, f: F1<T, U>): Maybe<U> {
    return maybe_fold(maybe, (a) => maybe_of(f(a)), maybe_none)
}

export function maybe_map_unary<T, U>(maybe: Maybe<T>): F1<F1<T, U>, Maybe<U>> {
    // return partial2_1(maybe_map, maybe)
    return (f: F1<T, U>) => maybe_fold(maybe, (a) => maybe_of(f(a)), maybe_none)
}

export function maybe_lift<T, U>(f: F1<T, U>): F1<Maybe<T>, Maybe<U>> {
    // return partial2_2(maybe_map, f)
    return (maybe: Maybe<T>) => maybe_fold(maybe, (a) => maybe_of(f(a)), maybe_none)
}

export function maybe_fold<T, U>(maybe: Maybe<T>, some: F1<T, U>, none: F0<U>): U {
    return maybe_fold1<T, U>(maybe)(some, none)
}

function maybe_fold1<T, U>(maybe: Maybe<T>): (some: F1<T, U>, none: F0<U>) => U {
    const privateMaybe = maybe as PrivateMaybe<T>
    return (some: F1<T, U>, none: F0<U>) => privateMaybe.value ? some(privateMaybe.value) : none()
}

interface PrivateMaybe<T> extends Maybe<T> {
    value?: T
}

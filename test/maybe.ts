const NONE: PrivateMaybe<any> = { value: undefined }

export interface Maybe<T> {
}

export function maybe_of<T>(value: T): Maybe<T> {
    return { value }
}

export function maybe_value<T>(maybe: Maybe<T>, defaultValue: () => T): T {
    return maybe_fold(maybe, identity, defaultValue)
}

export function maybe_value_unary<T>(maybe: Maybe<T>): (f: () => T) => T {
    return partial1(maybe_fold1(maybe), identity)
}

function maybe_what_is_this<T>(maybe: Maybe<T>, defaultValue: () => T): (f: (t:T) => T) => T {
    // maybe start of fold with given start value
    return partial2(maybe_fold1(maybe), defaultValue)
}

export function maybe_none<T>(): Maybe<T> {
    return NONE
}

export function maybe_map<T, U>(maybe: Maybe<T>, f: (a: T) => U): Maybe<U> {
    return maybe_fold(maybe, (a) => maybe_of(f(a)), maybe_none);
}

export function maybe_map_unary<T, U>(maybe: Maybe<T>): (f: (a: T) => U) => Maybe<U> {
    return partial1(maybe_map, maybe)
}

export function maybe_lift<T, U>(f: (a: T) => U): ((a: Maybe<T>) => Maybe<U>) {
    return partial2(maybe_map, f)
}

export function maybe_fold<T, U>(maybe: Maybe<T>, some: (a: T) => U, none: () => U): U {
    return maybe_fold1<T, U>(maybe)(some, none)
}

function maybe_fold1<T, U>(maybe: Maybe<T>): (some: (a: T) => U, none: () => U) => U {
    const privateMaybe = maybe as PrivateMaybe<T>;
    return (some: (a: T) => U, none: () => U) => privateMaybe.value ? some(privateMaybe.value) : none();
}

interface PrivateMaybe<T> extends Maybe<T> {
    value?: T
}

function identity<T>(a: T) {
    return a
}

function partial1<T, U, V>(f: (t: T, u: U) => V, first: T): (u: U) => V {
    return (u: U) => f(first, u)
}

function partial2<T, U, V>(f: (t: T, u: U) => V, second: U): (t: T) => V {
    return (t: T) => f(t, second)
}
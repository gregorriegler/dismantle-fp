/*
 * General support functions to enable FP style programming.
 */

export function identity1<T>(a: T) {
    return a
}

/**
 * Partially apply a binary function in the first argument.
 */
export function partial2_1<T, U, R>(f: (t: T, u: U) => R, first: T): (u: U) => R {
    return (u: U) => f(first, u)
}

/**
 * Partially apply a binary function in the second argument.
 */
export function partial2_2<T, U, R>(f: (t: T, u: U) => R, second: U): (t: T) => R {
    return (t: T) => f(t, second)
}

/**
 * Curry a binary function (which is partially applied in first argument).
 */
export function curry2<T, U, R>(f: (t: T, u: U) => R): (t: T) => ((u: U) => R) {
    return (t: T) => partial2_1(f, t)
}

export function partial3_1<T, U, V, R>(f: (t: T, u: U, v: V) => R, first: T): (u: U, v: V) => R {
    return (u: U, v: V) => f(first, u, v)
}

/**
 * Curry a ternary function (which is partially applied in first argument twice).
 */
export function curry3<T, U, V, R>(f: (t: T, u: U, v: V) => R): (t: T) => (u: U) => (v: V) => R {
    return (t: T) => curry2<U, V, R>(partial3_1<T, U, V, R>(f, t))
}

export function apply1<T, R>(f: (t: T) => R, value: T): R {
    return f(value)
}

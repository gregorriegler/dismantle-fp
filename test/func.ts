/*
 * General support functions to enable FP style programming.
 */

export interface F0<R> {
    (): R
}

export interface F1<T, R> {
    (t: T): R
}

export interface F2<T, U, R> {
    (t: T, u: U): R
}

export interface F3<T, U, V, R> {
    (t: T, u: U, v: V): R
}

export function identity1<T>(a: T): T {
    return a
}

/**
 * Partially apply a binary function on the first argument.
 */
export function partial2_1<T, U, R>(f: F2<T, U, R>, first: T): F1<U, R> {
    return (u: U) => f(first, u)
}

/**
 * Partially apply a binary function on the second argument.
 */
export function partial2_2<T, U, R>(f: F2<T, U, R>, second: U): F1<T, R> {
    return (t: T) => f(t, second)
}

/**
 * Partially apply a ternary function on the first argument.
 */
export function partial3_1<T, U, V, R>(f: F3<T, U, V, R>, first: T): F2<U, V, R> {
    return (u: U, v: V) => f(first, u, v)
}

/**
 * Curry a binary function (which is partially applied on first argument).
 */
export function curry2<T, U, R>(f: F2<T, U, R>): (t: T) => F1<U, R> {
    return (t: T) => partial2_1(f, t)
}

/**
 * Curry a ternary function (which is partially applied on first argument twice).
 */
export function curry3<T, U, V, R>(f: F3<T, U, V, R>): F1<T, F1<U, F1<V, R>>> {
    return (t: T) => curry2<U, V, R>(partial3_1<T, U, V, R>(f, t))
}

/**
 * Apply an unary function.
 */
export function apply1<T, R>(f: F1<T, R>, value: T): R {
    return f(value)
}

export function compose1<T, U, R>(a: F1<T, U>, b: F1<U, R>): F1<T, R> {
    return (t: T) => b(a(t))
}

export function lazy<R>(value: R): F0<R> {
    return () => value
}

export function should_not_call0<R>(): R {
    throw new Error("should not be called")
}

export function should_not_call1<T, R>(_: T): R {
    throw new Error("should not be called")
}

export function inc(a: number): number {
    return a + 1
}

export function add(a: number, b: number): number {
    return a + b
}

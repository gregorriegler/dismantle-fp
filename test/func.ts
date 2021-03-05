export function identity1<T>(a: T) {
    return a
}

export function partial2_1<T, U, V>(f: (t: T, u: U) => V, first: T): (u: U) => V {
    return (u: U) => f(first, u)
}

export function partial2_2<T, U, V>(f: (t: T, u: U) => V, second: U): (t: T) => V {
    return (t: T) => f(t, second)
}

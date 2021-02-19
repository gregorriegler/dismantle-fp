const NONE: PrivateMaybe<any> = {value: undefined}

export interface Maybe<T> {
}

export function maybe_of<T>(value: T): Maybe<T> {
    return {value}
}

export function maybe_value<T>(maybe: Maybe<T>, defaultValue: T): T {
    return maybe_fold(maybe, identity, () => defaultValue)
}

export function maybe_none<T>(): Maybe<T> {
    return NONE
}

export function maybe_map<T, U>(maybe: Maybe<T>, f: (a: T) => U): Maybe<U> {
    return maybe_fold(maybe, (a) => maybe_of(f(a)), maybe_none);
}

export function maybe_lift<T, U>(f: (a: T) => U): ((a: Maybe<T>) => Maybe<U>) {
    return (a: Maybe<T>) => maybe_map(a, f)
}

export function maybe_fold<T, U>(maybe: Maybe<T>, some: (a: T) => U, none: () => U): U {
    const privateMaybe = maybe as PrivateMaybe<T>;

    if (privateMaybe.value) {
        return some(privateMaybe.value)
    } else {
        // if we are empty we use the initial value
        return none()
    }
}

interface PrivateMaybe<T> extends Maybe<T> {
    value?: T
}

function identity<T>(a: T) {
    return a
}

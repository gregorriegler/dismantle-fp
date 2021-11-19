import { Maybe, maybe_of_nullable } from "../maybe_union"

export interface Map<T> extends Object {
}

type PrivateMap<T> = { [key: string]: T }

export function map_of_1<T>(key: string, value: T): Map<T> {
    return {
        [key]: value
    }
}

export function map_of_2<T>(key1: string, value1: T, key2: string, value2: T): Map<T> {
    return {
        [key1]: value1,
        [key2]: value2,
    }
}

// TODO  map_put

export function map_get<T>(map: Map<T>, key: string): Maybe<T> {
    const value = (map as PrivateMap<T>)[key]
    return maybe_of_nullable(value)
}

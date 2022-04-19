import { expect } from "chai"
import { F0, should_not_call0 } from "../func"
import { maybe_value } from "../maybe_union"
import { Seq, seq_first, seq_of_singleton } from "../seq"
import { expect_seq_empty, expect_seq_n_values } from "../seq_expects"

// --- retrofit array

export function array_lift<T, R>(mapFn: (value: T, index: number) => R): (items: T[]) => R[] {
    return (items) => items.map(mapFn)
}

export function array_map<T, R>(items: T[], mapFn: (value: T, index: number) => R): R[] {
    return array_lift(mapFn)(items)
}

export function array_bind<T, R>(mapFn: (value: T, index: number) => R[]): (items: T[]) => R[] {
    return (items) => array_flatten(array_map(items, mapFn))
}

export function array_flatmap<T, R>(items: T[], mapFn: (value: T, index: number) => R[]): R[] {
    return array_bind(mapFn)(items)
}

export function array_flatten<T>(items: T[][]): T[] {
    return items.reduce((acc, val) => acc.concat(val), [])
}

export function array_remover(index: number): <T>(items: T[]) => T[] {
    return <T>(items: T[]) => {
        const remainingItems = [...items]
        remainingItems.splice(index, 1)
        return remainingItems
    }
}

export function array_remove<T>(items: T[], index: number): T[] {
    return array_remover(index)(items)
}

export function array_prepender<T>(value: T): (items: T[]) => T[] {
    return (items) => [value].concat(items)
}

export function array_prepend<T>(items: T[], value: T): T[] {
    return array_prepender(value)(items)
}

// --- permutations

export function array_permutations<T>(items: T[]): T[][] {
    if (items.length == 1) {
        return [items]
    }
    function permutationsWithout(value: T, index: number): T[][] {
        const removeCurrentItem = array_remover(index)
        const remainingItems = removeCurrentItem(items)
        const furtherPermutations = array_permutations(remainingItems)
        const prepender = array_prepender(value)
        return array_lift(prepender)(furtherPermutations)
    }
    return array_bind(permutationsWithout)(items)
}

describe("array permutations", () => {
    it("of [1]", () => {
        const p = array_permutations([1])
        expect(p).to.deep.equal([[1]])
    })
    it("of [1,2]", () => {
        const p = array_permutations([1, 2])
        expect(p).to.deep.equal([[1, 2], [2, 1]])
    })
    it("of [1,2,3]", () => {
        const p = array_permutations([1, 2, 3])
        expect(p).to.deep.equal([[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]])
    })
})

// --- seq permutations

export function seq_permutations<T>(items: Seq<T>): Seq<Seq<T>> {
    return seq_of_singleton(items)
    // if (items.length == 1) {
    //     return [items]
    // }
    // function permutationsWithout(value: T, index: number): T[][] {
    //     const removeCurrentItem = array_remover(index)
    //     const remainingItems = removeCurrentItem(items)
    //     const furtherPermutations = array_permutations(remainingItems)
    //     const prepender = array_prepender(value)
    //     return array_lift(prepender)(furtherPermutations)
    // }
    // return array_bind(permutationsWithout)(items)
}

export function expect_seq_seq_n_values<T>(seq: Seq<Seq<T>>, values: T[][]) {
    const { head: first, tail } = seq_first(seq)
    if (values.length == 0) {
        expect_seq_empty(seq)
    } else {
        const first_seq: Seq<T> = maybe_value(first, should_not_call0 as F0<Seq<T>>)
        expect_seq_n_values(first_seq, ...values[0])
        expect_seq_seq_n_values(tail, values.slice(1))
    }
}

describe("seq permutations", () => {
    it("of [1]", () => {
        const seq = seq_permutations(seq_of_singleton(1))
        expect_seq_seq_n_values(seq, [[1]])
    })
})


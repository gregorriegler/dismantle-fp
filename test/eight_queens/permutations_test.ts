import { expect } from "chai"
import { F0, lazy, should_not_call0 } from "../func"
import { maybe_map, maybe_value } from "../maybe_union"
import { Seq, seq_bind_with_index, seq_first, seq_lift, seq_of_array, seq_of_empty, seq_of_singleton, seq_prepender, seq_remover } from "../seq"
import { expect_seq_empty, expect_seq_n_values } from "../seq_expects"

// --- retrofit array

function array_lift_index<T, R>(mapFn: (value: T, index: number) => R): (items: T[]) => R[] {
    return (items) => items.map(mapFn)
}

function array_map<T, R>(items: T[], mapFn: (value: T, index: number) => R): R[] {
    return array_lift_index(mapFn)(items)
}

function array_bind_with_index<T, R>(mapFn: (value: T, index: number) => R[]): (items: T[]) => R[] {
    return (items) => array_flatten(array_map(items, mapFn))
}

function array_flatmap<T, R>(items: T[], mapFn: (value: T, index: number) => R[]): R[] {
    return array_bind_with_index(mapFn)(items)
}

function array_flatten<T>(items: T[][]): T[] {
    return items.reduce((acc, val) => acc.concat(val), [])
}

function array_remover(index: number): <T>(items: T[]) => T[] {
    return <T>(items: T[]) => {
        const remainingItems = [...items]
        remainingItems.splice(index, 1)
        return remainingItems
    }
}

function array_remove<T>(items: T[], index: number): T[] {
    return array_remover(index)(items)
}

function array_prepender<T>(value: T): (items: T[]) => T[] {
    return (items) => [value].concat(items)
}

function array_prepend<T>(items: T[], value: T): T[] {
    return array_prepender(value)(items)
}

// --- array permutations

function array_permutations<T>(items: T[]): T[][] {
    if (items.length == 1) {
        return [items]
    }
    function permutationsWithout(value: T, index: number): T[][] {
        const remove_current_item = array_remover(index)
        const remaining_items = remove_current_item(items)
        const further_permutations = array_permutations(remaining_items)
        const prepender = array_prepender(value)
        return array_lift_index(prepender)(further_permutations)
    }
    return array_bind_with_index(permutationsWithout)(items)
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
    function permutationsWithout(value: T, index: number): Seq<Seq<T>> {
        const seq_v = seq_of_singleton(value)

        const remove_current_item = seq_remover<T>(index)
        const remaining_items = remove_current_item(items)
        // workaround for if
        const next_item = seq_first(remaining_items).head
        const remaining_permutations = maybe_map(next_item, (_) => {
            const further_permutations = seq_permutations(remaining_items)
            const prepender = seq_prepender(seq_v)
            return seq_lift(prepender)(further_permutations)
        })

        return maybe_value(remaining_permutations, lazy(seq_of_singleton(seq_v)))
    }

    return seq_bind_with_index(permutationsWithout)(items)
}

describe("Seq permutations", () => {
    it("of []", () => {
        const seq = seq_permutations(seq_of_empty())
        expect_seq_empty(seq)
    })
    it("of [1]", () => {
        const seq = seq_permutations(seq_of_singleton(1))
        expect_seq_seq_n_values(seq, [[1]])
    })
    it("of [1,2]", () => {
        const seq = seq_permutations(seq_of_array([1, 2]))
        expect_seq_seq_n_values(seq, [[1, 2], [2, 1]])
    })
    it("of [1,2,3]", () => {
        const seq = seq_permutations(seq_of_array([1, 2, 3]))
        expect_seq_seq_n_values(seq, [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]])
    })
})

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

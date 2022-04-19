import { expect } from "chai"
import { F0, F2, should_not_call0 } from "../func"
import { maybe_value } from "../maybe_union"
import { Indexed, Seq, SeqF1, seq_bind, seq_first, seq_is_empty, seq_join, seq_lift, seq_of_array, seq_of_empty, seq_of_singleton, seq_prepender, seq_remover, seq_to_indexed } from "../seq"
import { expect_seq_empty, expect_seq_n_values } from "../seq_expects"

// --- retrofit array

export function array_lift_index<T, R>(mapFn: (value: T, index: number) => R): (items: T[]) => R[] {
    return (items) => items.map(mapFn)
}

export function array_map<T, R>(items: T[], mapFn: (value: T, index: number) => R): R[] {
    return array_lift_index(mapFn)(items)
}

export function array_bind_with_index<T, R>(mapFn: (value: T, index: number) => R[]): (items: T[]) => R[] {
    return (items) => array_flatten(array_map(items, mapFn))
}

export function array_flatmap<T, R>(items: T[], mapFn: (value: T, index: number) => R[]): R[] {
    return array_bind_with_index(mapFn)(items)
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

describe("Seq (Monad) extension", () => {
    describe("remover", () => {
        it("remove from an empty seq", () => {
            const seq = seq_of_empty()

            const removed = seq_remover(0)(seq)

            expect_seq_n_values(removed)
        })

        it("remove from single seq", () => {
            const seq = seq_of_singleton(1)

            const removed = seq_remover(0)(seq)

            expect_seq_n_values(removed)
        })
        it("remove from seq beginning", () => {
            const seq = seq_of_array([1, 2])

            const removed = seq_remover(0)(seq)

            expect_seq_n_values(removed, 2)
        })
        it("remove from seq end", () => {
            const seq = seq_of_array([1, 2])

            const removed = seq_remover(1)(seq)

            expect_seq_n_values(removed, 1)
        })
        it("no remove from single seq", () => {
            const seq = seq_of_singleton(1)

            const removed = seq_remover(1)(seq)

            expect_seq_n_values(removed, 1)
        })
    })
    describe("prepender", () => {
        it("prepend empty", () => {
            const seq = seq_of_empty()

            const prepended = seq_prepender(1)(seq)

            expect_seq_n_values(prepended, 1)
        })
        it("prepend", () => {
            const seq = seq_of_singleton(2)

            const prepended = seq_prepender(1)(seq)

            expect_seq_n_values(prepended, 1, 2)
        })
    })
    describe("with index", () => {
        it("for empty", () => {
            const seq = seq_of_empty()

            const indexed = seq_to_indexed(seq, 0)

            expect_seq_n_values(indexed)
        })
        it("for seq", () => {
            const seq = seq_of_array([11, 12])

            const indexed = seq_to_indexed(seq, 1)

            expect_seq_n_values(indexed, { index: 1, value: 11 }, { index: 2, value: 12 })
        })
    })
})

// --- seq permutations

export function seq_bind_with_index<T, R>(f: F2<T, number, Seq<R>>): SeqF1<T, R> {
    const indexed_f = seq_bind(({ index, value }: Indexed<T>) => f(value, index))
    return (seq): Seq<R> => {
        const indexed = seq_to_indexed(seq, 0)
        return indexed_f(indexed)
    }
}

export function seq_permutations<T>(items: Seq<T>): Seq<Seq<T>> {
    function permutationsWithout(value: T, index: number): Seq<Seq<T>> {
        const remove_current_item = seq_remover<T>(index)
        const remaining_items = remove_current_item(items)
        if (seq_is_empty(remaining_items)) {
            return seq_of_singleton(seq_of_singleton(value))
        }
        const further_permutations = seq_permutations(remaining_items)

        const prepender = seq_prepender(value)
        return seq_lift(prepender)(further_permutations)
    }

    return seq_bind_with_index(permutationsWithout)(items)
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
})

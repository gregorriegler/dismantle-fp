import { expect } from "chai"
import { F0, F2, lazy, should_not_call0 } from "../func"
import { maybe_map, maybe_make_or, maybe_value } from "../maybe_union"
import { Seq, seq_first, seq_lift, seq_of_array, seq_of_empty, seq_of_singleton, seq_make_prepend_by, seq_make_remove_at, SeqF1, Indexed, seq_bind, seq_to_indexed, seq_size } from "../seq"
import { expect_seq_empty, expect_seq_n_values } from "../seq_expects"

// --- retrofit array

function array_lift_index<T, R>(mapFn: (value: T, index: number) => R): (items: T[]) => R[] {
    return (items) => items.map(mapFn)
}

function array_map<T, R>(items: T[], mapFn: (value: T, index: number) => R): R[] {
    return array_lift_index(mapFn)(items)
}

function indexed_array_bind<T, R>(mapFn: (value: T, index: number) => R[]): (items: T[]) => R[] {
    return (items) => array_flatten(array_map(items, mapFn))
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

function array_make_prepend_by<T>(value: T): (items: T[]) => T[] {
    return (items) => [value].concat(items)
}

// --- array permutations

export function array_permutations<T>(items: T[]): T[][] {
    if (items.length == 1) {
        return [items]
    }

    function permutations_without(item: T, at_index: number): T[][] {
        const current_item = item

        const remove_current_item = array_remover(at_index)
        const remaining_items = remove_current_item(items)

        function recurse_next_permutations() {
            const further_permutations = array_permutations(remaining_items)
            const prepender = array_make_prepend_by(item)
            return array_lift_index(prepender)(further_permutations)
        }

        const next_permutations = recurse_next_permutations()
        return next_permutations
    }

    return indexed_array_bind(permutations_without)(items)
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
    describe("by count", function () {
        it("of [1,2,3,4]", () => {
            const p = array_permutations([1, 2, 3, 4])
            expect(p.length).to.equal(4 * 3 * 2)
        })
        // approx 3 seconds = too slow
        it("of [1,2,3,4,5]", () => {
            const p = array_permutations([1, 2, 3, 4, 5])
            expect(p.length).to.equal(5 * 4 * 3 * 2)
        })
        it("of [1,2,3,4,5,6,7,8]", () => {
            const p = array_permutations([1, 2, 3, 4, 5, 6, 7, 8])
            expect(p.length).to.equal(8 * 7 * 6 * 5 * 4 * 3 * 2)
        })
    })
})

// --- seq permutations

export function seq_permutations<T>(items: Seq<T>): Seq<Seq<T>> {
    function permutations_without(item: T, at_index: number): Seq<Seq<T>> {
        const current_item = seq_of_singleton(item)

        const remove_current_item = seq_make_remove_at<T>(at_index)
        const remaining_items = remove_current_item(items)

        function recurse_next_permutations() {
            const further_permutations = seq_permutations(remaining_items)
            const prepender = seq_make_prepend_by(current_item)
            return seq_lift(prepender)(further_permutations)
        }

        // workaround for if
        const next_remaining_item = seq_first(remaining_items).head
        const next_permutations = maybe_map(next_remaining_item, recurse_next_permutations)

        const or_only_current_item = lazy(seq_of_singleton(current_item))
        return maybe_make_or(or_only_current_item)(next_permutations)
    }

    return indexed_seq_bind(permutations_without)(items)
}

function indexed_seq_bind<T, R>(f: F2<T, number, Seq<R>>): SeqF1<T, R> {
    const indexed_f = seq_bind(({ index, value }: Indexed<T>) => f(value, index))
    return (seq): Seq<R> => {
        const indexed = seq_to_indexed(seq, 0)
        return indexed_f(indexed)
    }
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
    describe("by count", function () {
        this.timeout(5000)
        it("of [1,2,3,4]", () => {
            const seq = seq_permutations(seq_of_array([1, 2, 3, 4]))
            const counts = seq_size(seq)
            expect(counts).to.equal(4 * 3 * 2)
        })
        // approx 3 seconds = too slow
        xit("of [1,2,3,4,5]", () => {
            const seq = seq_permutations(seq_of_array([1, 2, 3, 4, 5]))
            const counts = seq_size(seq)
            expect(counts).to.equal(5 * 4 * 3 * 2)
        })
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

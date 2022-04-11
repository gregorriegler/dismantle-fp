import { expect } from "chai"

// retrofit array

function array_map<T, R>(items: T[], mapFn: (value: T, index: number) => R): R[] {
    return items.map(mapFn)
}

function array_flatmap<T, R>(items: T[], mapFn: (value: T, index: number) => R[]): R[] {
    return array_flatten(array_map(items, mapFn))
}

function array_flatten<T>(items: T[][]): T[] {
    return items.reduce((acc, val) => acc.concat(val), [])
}

export function permutations<T>(items: T[]): T[][] {
    if (items.length == 1) {
        return [items]
    }
    return array_flatmap(items, (value: T, index: number) => {
        const remainingItems = [...items]
        remainingItems.splice(index, 1)
        return foo(value, remainingItems)
    })
}


function foo<T>(value: T, remainingItems: T[]): T[][] {
    const furtherPermutations = permutations(remainingItems)
    return array_map(furtherPermutations, (permutation) => [value].concat(permutation));
}

describe("permutations", () => {
    it("of [1]", () => {
        const p = permutations([1])
        expect(p).to.deep.equal([[1]])
    })
    it("of [1,2]", () => {
        const p = permutations([1, 2])
        expect(p).to.deep.equal([[1, 2], [2, 1]])
    })
})

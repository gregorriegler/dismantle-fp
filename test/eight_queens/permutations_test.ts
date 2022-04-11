import { expect } from "chai"

function permutations<T>(items: T[]): T[][] {
    if (items.length == 1) {
        return [items]
    }
    return items.map((value: T, index: number) => {
        const remainingItems = [...items]
        remainingItems.splice(index, 1)
        const furtherPermutations = permutations(remainingItems)
        return furtherPermutations.map((permutation) => [value].concat(permutation));
    }).reduce((acc, val) => acc.concat(val), []) // flat
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

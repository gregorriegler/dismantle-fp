import { expect } from "chai"
import { Maybe, maybe_is_none, maybe_value } from "./maybe_union"

export function expectEmpty(maybe: Maybe<any>) {
    expect(maybe_is_none(maybe), "maybe empty").to.be.true
}

export function expectValue<T>(maybe: Maybe<T>, expected: T) {
    expect(maybe_value(maybe, () => {
        throw new Error("expect value " + expected + ", found none")
    }
    )).to.equal(expected)
}

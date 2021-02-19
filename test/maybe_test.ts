import { expect } from "chai"
import { maybe_lift, maybe_map, maybe_none, maybe_of, maybe_value } from "./maybe";

describe('Maybe', () => {
    it('maybe of a value contains value', () => {
        const result = maybe_of(1)
        expect(maybe_value(result, 2)).to.equal(1)
    })

    it('maybe of none is empty', () => {
        const result = maybe_none()
        expect(maybe_value(result, 2)).to.equal(2)
    })

    it('map over maybe', () => {
        const maybeOne = maybe_of(1)
        const f = (a) => a + 1

        let maybeTwo = maybe_map(maybeOne, f);

        expect(maybe_value(maybeTwo, 3)).to.equal(2)
    })

    it('map over none', () => {
        const f = (_) => {
            throw new Error("should not be called")
        }

        let maybeTwo = maybe_map(maybe_none(), f);

        expect(maybe_value(maybeTwo, 3)).to.equal(3)
    })

    it('lift', () => {
        const f = (a) => a + 1

        let liftedF = maybe_lift(f);

        let maybeTwo = liftedF(maybe_of(1));
        expect(maybe_value(maybeTwo, 3)).to.equal(2)
    })

    it('evaluate a lifted with none', () => {
        const f = (_) => {
            throw new Error("should not be called")
        }

        let liftedF = maybe_lift(f);

        let maybeTwo = liftedF(maybe_none());
        expect(maybe_value(maybeTwo, 3)).to.equal(3)
    })


})

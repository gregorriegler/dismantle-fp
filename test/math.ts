import { F0 } from "./func"
import { Maybe, maybe_none, maybe_of } from "./maybe_union"

export function inc(a: number): number {
    return a + 1
}

export function is_divided(n: number, divisor: number): boolean {
    return n % divisor == 0
}

export function range_supplier(from: number, to: number): F0<Maybe<number>> {
    let i = from
    return function () {
        if (i > to) {
            return maybe_none()
        }
        return maybe_of(i++)
    }
}

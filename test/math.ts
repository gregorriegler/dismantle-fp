import { F0, F1 } from "./func"
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

export interface SupplyInitial<C, V> {
    supply: F1<C, SupplyStep<C, V>>,
    context: C
}

export interface SupplyStep<C, V> {
    value: Maybe<V>,
    context: C
}

export function range_supplier_pure(from: number, to: number): SupplyInitial<number, number> {
    const supply: F1<number, SupplyStep<number, number>> = (currentContext: number) => {
        if (currentContext > to) {
            return {
                value: maybe_none(),
                context: currentContext
            }
        }
        return {
            value: maybe_of(currentContext),
            context: currentContext + 1
        }
    }
    return {
        supply: supply,
        context: from
    }
}

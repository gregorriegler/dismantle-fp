import { ListFormat } from "typescript"
import { F1, F2 } from "../func"

export type Single<K, V> = {
    [K: string]: V
}

export type Pair<V1, V2> = Single<"left", V1> & Single<"right", V2>

// Pair is defined to be two elements, so it makes no sense to curry.
export function pair_of<V1, V2>(
    left: V1,
    right: V2
): Pair<V1, V2> {
    return {
        left: left,
        right: right
    } as any as Pair<V1, V2> // TODO BÖSE
}

export function pair_map<V1, NEW_V1, V2, NEW_V2>(
    pair: Pair<V1, V2>,
    map_l: F2<V1, V2, NEW_V1>,
    map_r: F2<V1, V2, NEW_V2>,
) {
    return pair_lift(map_l, map_r)(pair)
}

export function pair_lift<V1, NEW_V1, V2, NEW_V2>(
    map_l: F2<V1, V2, NEW_V1>,
    map_r: F2<V1, V2, NEW_V2>,
): F1<Pair<V1, V2>, Pair<NEW_V1, NEW_V2>> {
    return (pair: Pair<V1, V2>) => pair_of(
        map_l(pair["left"], pair["right"]),
        map_r(pair["left"], pair["right"]),
    )
}

import { F2 } from "../func"

export type Single<K, V> = {
    [K: string]: V
}

export type Pair<V1, V2> = Single<"left", V1> & Single<"right", V2>

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
    return pair_of(
        map_l(pair["left"], pair["right"]),
        map_r(pair["left"], pair["right"]),
    )
}
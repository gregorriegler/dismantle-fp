import { F2 } from "../func"

export type Single<K, V> = {
    [K: string]: V;
}

export type Pair<K1, V1, K2, V2> = Single<K1, V1> & Single<K2, V2>

export function pair_of<K1 extends string, V1, K2 extends string, V2>(
    left_name: K1,
    left: V1,
    right_name: K2,
    right: V2
): Pair<K1, V1, K2, V2> {
    return {
        [left_name]: left,
        [right_name]: right
    } as Pair<K1, V1, K2, V2>
}

export function pair_map<K1 extends string, V1, NEW_V1, K2 extends string, V2, NEW_V2>(
    pair: Pair<K1, V1, K2, V2>,
    map_l: F2<V1, V2, NEW_V1>,
    map_r: F2<V1, V2, NEW_V2>,
) {
    const left_name = Object.keys(pair)[0];
    const right_name = Object.keys(pair)[1];
    return pair_of(
        left_name,
        map_l(pair[left_name], pair[right_name]),
        right_name,
        map_r(pair[left_name], pair[right_name])
    )
}
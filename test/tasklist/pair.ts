import { F2 } from "../func"

export type Pair<L_NAME extends string, L, R_NAME extends string, R> = {
    [key in L_NAME]: L
} & { // & = intersection type
        [key in R_NAME]: R
    } & { // TODO hide these fields from outside
        _l_name: L_NAME
        _r_name: R_NAME
    }

export function pair_of<L_NAME extends string, L, R_NAME extends string, R>(
    left_name: L_NAME,
    left: L,
    right_name: R_NAME,
    right: R
): Pair<L_NAME, L, R_NAME, R> {
    return {
        [left_name]: left,
        [right_name]: right,
        _l_name: left_name,
        _r_name: right_name
    } as Pair<L_NAME, L, R_NAME, R>
}

export function pair_map<L_NAME extends string, L, NEW_L, R_NAME extends string, R, NEW_R>(
    pair: Pair<L_NAME, L, R_NAME, R>,
    map_l: F2<L, R, NEW_L>,
    map_r: F2<L, R, NEW_R>,
) {
    return pair_of(
        pair._l_name,
        map_l(pair[pair._l_name], pair[pair._r_name]),
        pair._r_name,
        map_r(pair[pair._l_name], pair[pair._r_name])
    )
}

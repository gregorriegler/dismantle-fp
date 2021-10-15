import { Maybe, maybe_none, maybe_of } from "../maybe_union";

// TODO map_create und map_put

export interface Map<T> extends Object {
}

type PrivateMap<T> = { [key: string]: T }

export function map_of_1<T>(key: string, value: T): Map<T> {
  return {
    [key]: value
  }
}

export function map_get<T>(map: Map<T>, key: string): Maybe<T> {
  const value = (map as PrivateMap<T>)[key];
  if (value) {
    return maybe_of(value)
  } else return maybe_none()
}
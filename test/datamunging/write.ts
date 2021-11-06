/*
 * General support functions to enable FP style programming.
 */
import { F0, F1 } from "../func"

export type Read<R> = F0<R>

/**
 * A Function that writes our Value (IO) to some output
 * This is the part with side-effects (non-pure, void)
 *
 * @param IO The type of the value that is going to be written
 */
export type Write<IO> = F1<IO, void>

export type WriteApplied<IO> = Write<Write<IO>>

export function sequence_writes<T>(a: Write<T>, b: Write<T>): Write<T> {
    return (write) => {
        a(write)
        b(write)
    }
}

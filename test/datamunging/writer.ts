import { compose2, curry2, curry3, F1, identity1 } from "../func"


/**
 * A Function that writes our Value (IO) to some output
 * This is the part with side-effects (non-pure, void)
 *
 * @type IO The type of the value that is going to be written
 * @param io The value that is going to be written
 */
export type Write<IO> = (io: IO) => void

/**
 * Writer monad which is a container (so it is an object)
 *
 * @type T Any kind of type we'd like to write
 * @type IO The type that is going to be written to the sink
 */
export interface Writer<T, IO> extends Object {
    readonly transform: F1<T, IO>
}

export function new_writer<IO>(): Writer<IO, IO> {
    return {transform: identity1}
}

// TODO could create writer_of that combines new_writer with writer_map

export function writer_map<V, T, IO>(writer: Writer<T, IO>, f: F1<V, T>): Writer<V, IO> {
    return {transform: (compose2(f, writer.transform))}
}

export type MapForWriter<V, T, IO> = F1<F1<V, T>, Writer<V, IO>>

export function create_map_for_writer<V, T, IO>(writer: Writer<T, IO>): MapForWriter<V, T, IO> {
    const writer_map_curried = curry2(writer_map)
    return writer_map_curried(writer)
}

// TODO do we need flatMap? Not a monad without flatMap.

/**
 * executes the actual writing (non-pure, returns void)
 *
 * @type T The type we want to write
 * @type IO The type that is going to be written (after transformation)
 * @param writer
 * @param t the value going to be written
 * @param ioWrite the function that takes the value and writes it
 */
export function writer_apply<T, IO>(writer: Writer<T, IO>, t: T, ioWrite: Write<IO>): void {
    writer_ap(writer, ioWrite)(t)
}

export function writer_ap<T, IO>(writer: Writer<T, IO>, ioWrite: Write<IO>): Write<T> {
    return (t: T) => ioWrite(writer.transform(t))
}

export type ApplyForWriter<T, IO> = F1<T, F1<Write<IO>, void>>

export function create_apply_for_writer<T, IO>(writer: Writer<T, IO>): ApplyForWriter<T, IO> {
    const writer_apply_curried = curry3(writer_apply)
    return writer_apply_curried(writer)
}

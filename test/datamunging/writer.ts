import { compose2, curry3, F1, identity1 } from "../func"


/**
 * A Function that writes our Value (IO) to some output
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
    return { transform: identity1 }
}

// TODO could create writer_of that combines new_writer with writer_map

export function writer_map<V, T, IO>(writer: Writer<T, IO>, f: F1<V, T>): Writer<V, IO> {
    return { transform: (compose2(f, writer.transform)) }
}

// TODO do we need flatMap? Not a monad without flatMap.

/**
 *
 * @param writer
 * @param t
 * @param ioWrite the function that takes the Value and outputs it
 */
export function writer_apply<T, IO>(writer: Writer<T, IO>, t: T, ioWrite: Write<IO>): void {
    ioWrite(writer.transform(t))
}

// export function
// const apply_writer = curry3(writer_apply) // this should be part of the writer lib
// const write = apply_writer(string_writer) // or even this

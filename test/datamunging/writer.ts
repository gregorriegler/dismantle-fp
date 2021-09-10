import { compose2, curry3, F1, identity1 } from "../func"


/**
 * A Function that writes our Value (IO) to some output
 *
 * @type IO The type of the value that is going to be written
 * @param io The value that is going to be written
 */
export type Write<IO> = (io: IO) => void

interface Output<T, IO> extends Object {
    readonly transform: F1<T, IO>
}

export type Writer<T, IO> = Output<T, IO>

export function writer_of<IO>(): Writer<IO, IO> {
    return { transform: identity1 }
}

export function writer_map<V, T, IO>(writer: Writer<T, IO>, f: F1<V, T>): Writer<V, IO> {
    return { transform: (compose2(f, writer.transform)) }
}

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

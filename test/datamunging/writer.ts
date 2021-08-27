import { compose2, F1, identity1 } from "../func"

export interface Write<IO> {
    (io: IO): void
}

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

export function writer_apply<T, IO>(writer: Writer<T, IO>, t: T, ioWrite: Write<IO>): void {
    ioWrite(writer.transform(t))
}

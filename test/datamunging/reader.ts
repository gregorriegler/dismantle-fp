import { readFileSync } from "fs"
import { compose1, F0, F1, identity1 } from "../func"

export function io_read_file(fileName: string): Read<string> {
    return () => readFileSync(fileName).toString()
}

type Read<IO> = F0<IO>

interface Input<IO, R> extends Object {
    readonly transform: F1<IO, R>
}

export type Reader<IO, R> = Input<IO, R>

export function reader_of<IO>(): Reader<IO, IO> {
    return { transform: identity1 }
}

export function reader_map<IO, T, R>(reader: Reader<IO, T>, f: F1<T, R>): Reader<IO, R> {
    return { transform: (compose1(reader.transform, f)) }
}

export function reader_lift<IO, T, R>(f: F1<T, R>): F1<Reader<IO, T>, Reader<IO, R>> {
    return (reader) => reader_map(reader, f)
}

export function reader_flatmap<IO, T, R>(reader: Reader<IO, T>, f: F1<T, Reader<IO, R>>): Reader<IO, R> {
    return reader_bind(f)(reader)
}

export function reader_bind<IO, T, R>(f: F1<T, Reader<IO, R>>): F1<Reader<IO, T>, Reader<IO, R>> {
    return (reader: Reader<IO, T>) => {
        function nestedTransform(input: IO) {
            const transformedInput = reader_apply_single(reader, input)
            return reader_apply_single(f(transformedInput), input)
            // see https://gist.github.com/teazaid/c8e200ad07156de22da94c01ffc81014#file-userrepositorywrappermonad-scala
        }
        return { transform: nestedTransform }
    }
}

export function reader_apply<IO, R>(reader: Reader<IO, R>, ioRead: Read<IO>): R {
    return reader_apply_single(reader, ioRead())
}

function reader_apply_single<IO, R>(reader: Reader<IO, R>, input: IO): R {
    return reader.transform(input)
}

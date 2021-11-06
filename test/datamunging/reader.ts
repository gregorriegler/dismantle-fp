import { readFileSync } from "fs"
import { compose2, F1, identity1, Read } from "../func"

export function io_read_file(fileName: string): Read<string> {
    return () => readFileSync(fileName).toString()
}

export interface Reader<IO, R> extends Object {
}

interface PrivateReader<IO, R> extends Reader<IO, R> {
    readonly transform: F1<IO, R>
}

export function new_reader<IO>(): Reader<IO, IO> {
    return {
        transform: identity1
    } as PrivateReader<IO, IO>
}

// export type ReaderConstructor<IO, R> = F1<F1<IO, R>, Reader<IO, R>>
export function reader_of<IO, R>(f: F1<IO, R>): Reader<IO, R> {
    const reader: Reader<IO, IO> = new_reader()
    return reader_map(reader, f)
}

export function reader_map<IO, T, R>(reader: Reader<IO, T>, f: F1<T, R>): Reader<IO, R> {
    return {
        transform: (compose2((reader as PrivateReader<IO, T>).transform, f))
    } as PrivateReader<IO, R>
}

export type ReaderF1<IO, T, R> = F1<Reader<IO, T>, Reader<IO, R>>

export function reader_lift<IO, T, R>(f: F1<T, R>): ReaderF1<IO, T, R> {
    return (reader) => reader_map(reader, f)
}

export function reader_flatmap<IO, T, R>(reader: Reader<IO, T>, f: F1<T, Reader<IO, R>>): Reader<IO, R> {
    return reader_bind(f)(reader)
}

export function reader_bind<IO, T, R>(f: F1<T, Reader<IO, R>>): ReaderF1<IO, T, R> {
    return (reader: Reader<IO, T>) => {
        function nestedTransform(input: IO) {
            const transformedInput = reader_apply_single(reader, input)
            return reader_apply_single(f(transformedInput), input)
            // see https://gist.github.com/teazaid/c8e200ad07156de22da94c01ffc81014#file-userrepositorywrappermonad-scala
        }

        return { transform: nestedTransform }
    }
}

export function reader_apply<IO, R>(reader: Reader<IO, R>, io_read: Read<IO>): R {
    return reader_apply_single(reader, io_read())
}

function reader_apply_single<IO, R>(reader: Reader<IO, R>, input: IO): R {
    return (reader as PrivateReader<IO, R>).transform(input)
}

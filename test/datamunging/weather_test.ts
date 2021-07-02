import { expect } from "chai"
import { readFileSync } from "fs"
import { EOL } from "os"
import { compose0, compose1, F0, F1, F2, identity1 } from "../func"

function io_read_file(fileName: string): F0<string> {
    return () => readFileSync(fileName).toString()
}

const TestFile = "./test/datamunging/testFile.dat"

describe("Reader", () => {
    it("io_read_file", () => {
        const file = io_read_file(TestFile)

        expect(file()).to.equal("a" + EOL + "b" + EOL)
    })

    it("executes io", () => {
        const io_function = io_read_file(TestFile)
        const reader = reader_of<string>()

        const result = reader_apply(reader, io_function)

        expect(result()).to.equal("a" + EOL + "b" + EOL)
    })

    it("maps io", () => {
        const io_function = io_read_file(TestFile)
        const reader = reader_of<string>()
        const mapped_reader = reader_map(reader, (s) => s.split(EOL))

        const result = reader_apply(mapped_reader, io_function)

        expect(result()).to.deep.equal(["a", "b", ""])
    })

    it("flat maps io", () => {

        function countLines(s: string): Reader<string, number> {
            const reader = reader_of<string>()
            const mapped_reader = reader_map(reader, (s) => s.split(EOL))
            const count_reader = reader_map(mapped_reader, (array) => array.length)
            return count_reader
        }

        const io_function = io_read_file(TestFile)
        const reader = reader_of<string>()
        const mapped_reader = reader_bind(countLines)(reader)

        const result = reader_apply(mapped_reader, io_function)

        expect(result()).to.equal(3)
    })

    // functor needs 2 operations
    // of, lift (map)
    // monad needs 2 operations
    // of, flatmap (bind)
})

    // TODO 3. make this test work
    // describe("Writer", () => {
    //     it("writes to io", () => {
    //         let sink = ""
    //         function io_print(message: string) {
    //             sink += message + "\n"
    //         }

    //         const writer = writer_of<string, string>((a,b,c) => "Hello World")

    //         const io_function = io_read_file(TestFile)
    //         const result = reader_apply(reader, io_print)
    //         const val = result()
    //         expect(sink).to.equal("foo")
    //     })
    // })

interface Input<IO, R> extends Object {
    readonly map: F1<IO, R>
}

export type Reader<IO, R> = Input<IO, R>

export function reader_of<IO>(): Reader<IO, IO> {
    return {map: identity1}
}

export function reader_map<IO, T, R>(reader: Reader<IO, T>, f: F1<T, R>): Reader<IO, R> {
    return {map: (compose1(reader.map, f))}
}

export function reader_lift<IO, T, R>(f: F1<T, R>): F1<Reader<IO, T>, Reader<IO, R>> {
    return (reader) => reader_map(reader, f)
}

export function reader_flatmap<IO, T, R>(reader: Reader<IO, T>, f: F1<T, Reader<IO, R>>): Reader<IO, R> {
    return reader_bind(f)(reader)
}

export function reader_bind<IO, T, R>(f: F1<T, Reader<IO, R>>): F1<Reader<IO, T>, Reader<IO, R>> {
    return (reader: Reader<IO, T>) => {


    }
}

export function reader_apply<IO, R>(reader: Reader<IO, R>, io: F0<IO>): F0<R> {
    return compose0(io, reader.map)
}

// TODO 2. Output only has Type IO
interface Output<T, IO> extends Object {
    readonly write: F2<T, IO, never>
}

export type Writer<T, IO> = Output<T, IO>

export function writer_of<T, IO>(write: F2<T, IO, never>): Writer<T, IO> {
    return {write: write}
}

export function writer_map<V, T, IO>(writer: Writer<T, IO>, f: F1<V, T>): Writer<V, IO> {
    return writer_of((v: V, io: IO) => writer.write(f(v), io))
}

export function writer_apply<T, IO>(writer: Writer<T, IO>, io: F0<IO>): F1<T, never> {
    return (t: T) => writer.write(t, io())
    // return compose0(writer.write, io)
}

/*
Dy MxT   MnT   AvT   HDDay  AvDP 1HrP TPcpn WxType PDir AvSp Dir MxS SkyC MxR MnR AvSLP

   1  88    59    74          53.8       0.00 F       280  9.6 270  17  1.6  93 23 1004.5
   2  79    63    71          46.5       0.00         330  8.7 340  23  3.3  70 28 1004.5
*/

/*
* Algorithm (solution)
* - read lines
* - calc spread
* - find min
* - report day
*
* Design (units)
* - outside in
*/

const Data1Line = "./test/datamunging/weather1line.dat"

function find_min_spread(text: string): number {
    // will be calculated using seq
    return 1
}
describe("Weather Data", () => {

    it("find_min_spread", () => {
        const reader: Input<string, string> = reader_of()

        const reader_mapped: Reader<string, number> = reader_map(reader, find_min_spread);

        const io_function = io_read_file(TestFile)
        const result = reader_apply(reader_mapped, io_function)
        expect(result()).to.equal(1)
    })

    // TODO print final solution to console
})

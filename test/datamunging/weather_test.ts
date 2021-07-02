import { expect } from "chai"
import { readFileSync } from "fs"
import { EOL } from "os"
import { compose1, F0, F1, F2, identity1 } from "../func"

function io_read_file(fileName: string): Read<string> {
    return () => readFileSync(fileName).toString()
}

const TestFile = "./test/datamunging/testFile.dat"

describe("Reader", () => {
    it("io_read_file", () => {
        const file = io_read_file(TestFile)

        expect(file()).to.equal("a" + EOL + "b" + EOL)
    })

    it("executes io", () => {
        const reader = reader_of<string>()

        const io_function = io_read_file(TestFile)
        const result = reader_apply(reader, io_function)

        expect(result).to.equal("a" + EOL + "b" + EOL)
    })

    it("maps io", () => {
        const reader = reader_of<string>()
        const mapped_reader = reader_map(reader, (s) => s.split(EOL))

        const io_function = io_read_file(TestFile)
        const result = reader_apply(mapped_reader, io_function)

        expect(result).to.deep.equal(["a", "b", ""])
    })

    it("binds io", () => {
        const reader = reader_of<string>()
        function countLines(s: string): Reader<string, number> {
            const reader = reader_of<string>()
            const mapped_reader = reader_map(reader, (s) => s.split(EOL))
            const count_reader = reader_map(mapped_reader, (array) => array.length)
            return count_reader
        }
        const mapped_reader = reader_bind(countLines)(reader)

        const io_function = io_read_file(TestFile)
        const result = reader_apply(mapped_reader, io_function)

        expect(result).to.equal(3)
    })

    // functor needs 2 operations
    // of, lift (map)
    // monad needs 2 operations
    // of, flatmap (bind)
})

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

describe("Writer", () => {
    it("writes to io", () => {
        let sink = ""
        function io_print(message: string) {
            sink += message + "\n"
        }

        const writer = writer_of<string>()
        writer_apply(writer, "Hello World", io_print)

        expect(sink).to.equal("Hello World\n")
    })
})

interface Write<IO> {
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
    return { transform: (compose1(f, writer.transform)) }
}

export function writer_apply<T, IO>(writer: Writer<T, IO>, t: T, ioWrite: Write<IO>): void {
    ioWrite(writer.transform(t))
}

/*
Dy MxT   MnT   AvT   HDDay  AvDP 1HrP TPcpn WxType PDir AvSp Dir MxS SkyC MxR MnR AvSLP

   1  88    59    74          53.8       0.00 F       280  9.6 270  17  1.6  93 23 1004.5
   2  79    63    71          46.5       0.00         330  8.7 340  23  3.3  70 28 1004.5
*/

const Data1Line = "./test/datamunging/weather1line.dat"
const FullFile = "./test/datamunging/weather.dat"

function find_min_spread(text: string): number {
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

    // will be calculated using seq
    return 1
}

function console_print(message: string) {
    console.log(message + "\n")
}

describe("Weather Data", () => {

    it("run application", () => {
        const reader: Reader<string, string> = reader_of()

        const reader_mapped: Reader<string, number> = reader_map(reader, find_min_spread)

        const io_function = io_read_file(Data1Line)
        const result = reader_apply(reader_mapped, io_function)
        expect(result).to.equal(1)

        const writer: Writer<string, string> = writer_of()
        const writer_mapped: Writer<number, string> = writer_map(writer, (n) => "" + n)
        writer_apply(writer_mapped, result, console_print)
    })
})

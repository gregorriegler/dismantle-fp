import { expect } from "chai"
import { readFileSync } from "fs"
import { compose0, compose1, F0, F1, identity1 } from "../func"

function io_read_file(fileName: string): F0<string> {
    return () => readFileSync(fileName).toString()
}

const TestFile = "./test/datamunging/part1/testFile.dat"

describe("Weather Data infrastructure", () => {

    describe("IO", () => {
        it("io_read_file", () => {
            const file = io_read_file(TestFile)

            expect(file()).to.equal("a\nb\n")
        })
    })

    describe("Reader", () => {
        it("executes io", () => {
            const reader = reader_of<string, string>(identity1)
            const io_function = io_read_file(TestFile)

            const result = reader_apply(reader, io_function)

            expect(result()).to.equal("a\nb\n")
        })
    })
})

interface Value<IO, R> extends Object {
    readonly operation: F1<IO, R>
}

export type Reader<IO, R> = Value<IO, R>

export function reader_of<IO, R>(f: F1<IO, R>): Reader<IO, R> {
    return {operation: f}
}

export function reader_map<IO, T, R>(reader: Reader<IO, T>, f: F1<T, R>): Reader<IO, R> {
    return reader_of(compose1(reader.operation, f));
}

function reader_apply<IO, R>(reader: Reader<IO, R>, io: F0<IO>): F0<R> {
    return compose0(io, reader.operation)
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

const Data1Line = "./test/datamunging/part1/weather1line.dat"

function find_min_spread(text: string): number {
    return 1
}
describe("Weather Data", () => {

    it("find_min_spread", () => {
        // sketch

        const reader: Value<string, string> = reader_of(identity1)

        const reader_mapped: Reader<string, number> = reader_map(reader, find_min_spread);

        const io_function = io_read_file(TestFile)
        const result = reader_apply(reader_mapped, io_function)
        expect(result()).to.equal(1)
    })
})

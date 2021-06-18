import { expect } from "chai"
import { readFileSync } from "fs"
import { compose0, F0, F1, identity1 } from "../func"
import { expectEmpty, expectValue } from "../maybe_expects"
import { Maybe, maybe_none, maybe_of } from "../maybe_union"
import { Seq, seq_of_empty, seq_of_supplier } from "../seq"
import { expect_seq_four_values, expect_seq_three_values } from "../seq_expects"

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

function io_read_file(fileName: string): F0<string> {
    return () => readFileSync(fileName).toString()
}

const TestFile = "./test/datamunging/part1/testFile.dat"

describe("Weather Data", () => {

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
    return { operation: f }
}

function reader_apply<IO, R>(reader: Reader<IO, R>, io: F0<IO>): F0<R> {
    return compose0(io, reader.operation)
}









const Data1Line = "./test/datamunging/part1/weather1line.dat"

describe("Weather Data", () => {

    xit("find_min_spread", () => {
        // sketch
        // const reader = reader_of(read_lines_from_file)
        // const get_day = reader.map.map(parse).map(calc).reduce(find_minium).first().firstColumn()
        // expect(get_day(read_file(filename))).to.equal(1)
    })

    xit("io_read_file", () => {
        // const io = io_read_file(Data1Line)

        // const lines = io()

        // expect_seq_four_values(lines,
        //     "  Dy MxT   MnT   AvT   HDDay  AvDP 1HrP TPcpn WxType PDir AvSp Dir MxS SkyC MxR MnR AvSLP",
        //     "",
        //     "   1  88    59    74          53.8       0.00 F       280  9.6 270  17  1.6  93 23 1004.5",
        //     "  mo  82.9  60.5  71.7    16  58.8       0.00              6.9          5.3")
    })
})

// function io_read_file(filename: string): () => Seq<string> {
//     return () => seq_of_supplier(read_file(filename))
// }

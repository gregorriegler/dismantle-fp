import { expect } from "chai"
import { readFileSync } from "fs"
import { F0 } from "../func"
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

function io_read_file(fileName: string): Maybe<string> {
    const text = readFileSync(fileName).toString();
    return maybe_of(text)
}

const Data1Line = "./test/datamunging/part1/weather1line.dat"
const TestFile = "./test/datamunging/part1/testFile.dat"

describe("Weather Data", () => {

    it("io_read_file", () => {
        const file = io_read_file(TestFile)

        expectValue(file, "a\nb\n")
    })

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


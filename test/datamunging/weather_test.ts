import { expect } from "chai"
import { EOL } from "os"
import { Seq, seq_filter, seq_fold, seq_map, seq_of_array } from "../seq"
import { io_read_file, Reader, reader_apply, reader_map, reader_of } from "./reader"
import { Writer, writer_apply, writer_map, writer_of } from "./writer"

// 1st idea: List of functions to map onto the Reader.

function splitIntoLines(fileText: string): Seq<string> {
    return seq_of_array(fileText.split(EOL))
}

function trim(line: string): string {
    return line.trim()
}

function isNonEmptyLine(line: string): boolean {
    return line.length > 0
}

function isDataLine(nonEmptyLine: string): boolean {
    const firstCharacter = nonEmptyLine.charAt(0)
    return !isNaN(+firstCharacter)
}

interface DataEntry {
    Dy: number
    MxT: number
    MnT: number
    spread(): number;
}

function parseData(dataLine: string): DataEntry {
    const entries = dataLine.split(/\s+/).slice(0, 3).map(s => parseInt(s, 10))
    return {
        Dy: entries[0],
        MxT: entries[1],
        MnT: entries[2],
        spread() {
            return this.MxT - this.MnT
        }
    }
}

function minEntry(a: DataEntry, b: DataEntry): DataEntry {
    if (a.spread() < b.spread()) {
        return a
    }
    return b
}

// 2nd idea: Go into find_min_spread and map there only once.
// No fine grained methods on reader_map.

function find_min_spread(fileText: string): number {
    // Algorithm (solution) will be calculated using seq

    // read lines
    const lines = splitIntoLines(fileText)
    const trimmedLines = seq_map(lines, trim)
    const nonEmptyLines = seq_filter(trimmedLines, isNonEmptyLine)
    const dataLines = seq_filter(nonEmptyLines, isDataLine)
    // calc spread
    const dataEntries = seq_map(dataLines, parseData)
    // find min
    const min = seq_fold(dataEntries, minEntry, parseData("0 999 0"))
    // report day
    return min.Dy
}

function console_print(message: string) {
    console.log(message + "\n")
}

// -------- test ---------

const Data1Line = "./test/datamunging/weather1line.dat"
const FullFile = "./test/datamunging/weather.dat"

describe("Weather Data (application of Reader)", () => {

    describe("used functions", () => {

        it("splitIntoLines", () => {
            // tested in "Reader maps io"
        })

        it("trim", () => {
            expect(trim("  ")).to.equal("")
            expect(trim(" a ")).to.equal("a")
        })

        it("isNonEmptyLine", () => {
            expect(isNonEmptyLine("")).to.be.false
            expect(isNonEmptyLine("11  88    59    74")).to.be.true
        })

        it("isDataLine", () => {
            expect(isDataLine("Dy MxT   MnT   AvT   ")).to.be.false
            expect(isDataLine("11  88    59    74")).to.be.true
        })

        it("parseData", () => {
            const a = parseData("1  88    59*    74     ")
            expect(a.Dy).to.equal(1)
            expect(a.MxT).to.equal(88)
            expect(a.MnT).to.equal(59)
            expect(a.spread()).to.equal(88 - 59)
        })

        it("minEntry", () => {
            const a = parseData("1 10 5 13")
            const b = parseData("2 12 5 15")
            expect(minEntry(a, b)).to.deep.equal(a)
        })

    })

    xit("find_min_spread filters", () => {
        const reader: Reader<string, string> = reader_of()

        const reader_mapped: Reader<string, number> = reader_map(reader, find_min_spread)

        const io_function = io_read_file(Data1Line)
        const result = reader_apply(reader_mapped, io_function)
        expect(result).to.equal(1)
    })

    xit("run application", () => {
        const reader: Reader<string, string> = reader_of()

        const reader_mapped: Reader<string, number> = reader_map(reader, find_min_spread)

        const io_function = io_read_file(FullFile)
        const result = reader_apply(reader_mapped, io_function)
        expect(result).to.equal(1)

        const writer: Writer<string, string> = writer_of()
        const writer_mapped: Writer<number, string> = writer_map(writer, (n) => "" + n)
        writer_apply(writer_mapped, result, console_print)
    })
})

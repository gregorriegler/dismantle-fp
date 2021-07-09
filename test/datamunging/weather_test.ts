import { expect } from "chai"
import { EOL } from "os"
import { Seq, seq_filter, seq_fold, seq_map, seq_of_array } from "../seq"
import { io_read_file, Reader, reader_apply, reader_map, reader_of } from "./reader"
import { Writer, writer_apply, writer_of } from "./writer"

// 1st idea: List of functions to map onto the Reader.

// -------- requirement 1 ---------

function splitIntoLines(fileText: string): Seq<string> {
    return seq_of_array(fileText.split(EOL))
}

function trim(line: string): string {
    return line.trim()
}

function isNonEmptyLine(line: string): boolean {
    return line.length > 0
}

function startsWithDigit(nonEmptyLine: string): boolean {
    const firstCharacter = nonEmptyLine.charAt(0)
    return !isNaN(+firstCharacter)
}

interface WeatherEntry {
    Dy: string
    MxT: number
    MnT: number
    spread(): number;
}

function parseWeatherData(dataLine: string): WeatherEntry {
    const entries = dataLine.split(/\s+/)
    return {
        Dy: entries[0],
        MxT: parseInt(entries[1], 10),
        MnT: parseInt(entries[2], 10),
        spread() {
            return this.MxT - this.MnT
        }
    }
}

// 2nd idea: Go into find_min_spread and map there only once.
// No fine grained methods on reader_map.

function find_min_temp_spread(fileText: string): string {
    // Algorithm (solution) will be calculated using seq

    // read lines
    const lines = splitIntoLines(fileText)
    const trimmedLines = trimLines(lines)
    const nonEmptyLines = filterNonEmptyLines(trimmedLines)
    const dataLines = filterDataLines(nonEmptyLines)
    // calc spread
    const dataEntries = parseDataEntries(dataLines)
    // find min
    const min = getMinEntry(dataEntries)
    // report day
    return min.Dy
}

function trimLines(lines: Seq<string>) {
    return seq_map(lines, trim);
}

function filterNonEmptyLines(trimmedLines: Seq<string>) {
    return seq_filter(trimmedLines, isNonEmptyLine);
}

function filterDataLines(nonEmptyLines: Seq<string>) {
    return seq_filter(nonEmptyLines, startsWithDigit);
}

function parseDataEntries(dataLines: Seq<string>) {
    return seq_map(dataLines, parseWeatherData);
}

function getMinEntry(dataEntries: Seq<WeatherEntry>) {
    return seq_fold(dataEntries, minEntry, {
        Dy: "", MxT: 0, MnT: 0, spread() {
            return 999
        }
    } as WeatherEntry);
}

function minEntry<T extends { spread(): number }>(a: T, b: T): T {
    if (a.spread() < b.spread()) {
        return a
    }
    return b
}

function console_print(message: string) {
    console.log(message + "\n")
}

// -------- test ---------

const WeatherData1Line = "./test/datamunging/weather1line.dat"
const WeatherDataFile = "./test/datamunging/weather.dat"

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

        it("startsWithDigit", () => {
            expect(startsWithDigit("Dy MxT   MnT   AvT   ")).to.be.false
            expect(startsWithDigit("11  88    59    74")).to.be.true
        })

        it("parseWeatherData", () => {
            const a = parseWeatherData("1  88    59*    74     ")
            expect(a.Dy).to.equal("1")
            expect(a.MxT).to.equal(88)
            expect(a.MnT).to.equal(59)
            expect(a.spread()).to.equal(88 - 59)
        })

        it("minEntry", () => {
            const a = parseWeatherData("1 10 5 13")
            const b = parseWeatherData("2 12 5 15")
            expect(minEntry(a, b)).to.deep.equal(a)
        })

    })

    it("find_min_temp_spread filters", () => {
        const reader: Reader<string, string> = reader_of()

        const reader_mapped: Reader<string, string> = reader_map(reader, find_min_temp_spread)

        const io_function = io_read_file(WeatherData1Line)
        const result = reader_apply(reader_mapped, io_function)
        expect(result).to.equal("1")
    })

    it("run application", () => {
        const reader: Reader<string, string> = reader_of()

        const reader_mapped: Reader<string, string> = reader_map(reader, find_min_temp_spread)

        const io_function = io_read_file(WeatherDataFile)
        const result = reader_apply(reader_mapped, io_function)
        expect(result).to.equal("14")

        const writer: Writer<string, string> = writer_of()
        writer_apply(writer, result, console_print)
    })
})

// -------- requirement 2 ---------

interface FootballEntry {
    Team: string
    F: number
    A: number
    spread(): number;
}

function parseFootballData(dataLine: string): FootballEntry {
    const entries = dataLine.split(/\s+/)
    return {
        Team: entries[1],
        F: parseInt(entries[6], 10),
        A: parseInt(entries[8], 10),
        spread() {
            return Math.abs(this.F - this.A)
        }
    }
}

function find_min_goal_spread(fileText: string): string {
    const lines = splitIntoLines(fileText)
    const trimmedLines = seq_map(lines, trim)
    const nonEmptyLines = seq_filter(trimmedLines, isNonEmptyLine)
    const dataLines = seq_filter(nonEmptyLines, startsWithDigit)
    const dataEntries = seq_map(dataLines, parseFootballData)
    const min = seq_fold(dataEntries, minEntry, { Team: "", F: 0, A: 0, spread() { return 999 } } as FootballEntry)
    return min.Team
}

const FootballDataFile = "./test/datamunging/football.dat"

describe("Football Data (reuse Weather Data)", () => {
    it("run application", () => {
        const reader: Reader<string, string> = reader_of()

        const reader_mapped: Reader<string, string> = reader_map(reader, find_min_goal_spread)

        const io_function = io_read_file(FootballDataFile)
        const result = reader_apply(reader_mapped, io_function)
        expect(result).to.equal("Aston_Villa")
    })
})

// -------- requirement 3 ---------

// TODO data entries and parse data are different. Should we do sth about it?

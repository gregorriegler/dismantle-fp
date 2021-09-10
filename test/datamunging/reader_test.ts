import { expect } from "chai"
import { EOL } from "os"
import { io_read_file, Reader, reader_apply, reader_bind, reader_map, new_reader } from "./reader"

const TestFile = "./test/datamunging/testFile.dat"

describe("Reader (Monad)", () => {
    it("io_read_file", () => {
        const file = io_read_file(TestFile)

        expect(file()).to.equal("a" + EOL + "b" + EOL)
    })

    it("executes io", () => {
        const reader = new_reader<string>()

        const io_function = io_read_file(TestFile)
        const result = reader_apply(reader, io_function)

        expect(result).to.equal("a" + EOL + "b" + EOL)
    })

    it("maps io", () => {
        const reader = new_reader<string>()
        const mapped_reader = reader_map(reader, (s) => s.split(EOL))

        const io_function = io_read_file(TestFile)
        const result = reader_apply(mapped_reader, io_function)

        expect(result).to.deep.equal(["a", "b", ""])
    })

    it("binds io", () => {
        const reader = new_reader<string>()
        function countLines(s: string): Reader<string, number> {
            const reader = new_reader<string>()
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

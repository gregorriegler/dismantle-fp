import { expect } from "chai"
import { writer_apply, new_writer } from "./writer"

describe("Writer (Monad)", () => {
    it("writes to io", () => {
        let sink = ""
        function io_print(message: string) {
            sink += message + "\n"
        }

        const writer = new_writer<string>()
        writer_apply(writer, "Hello World", io_print)

        expect(sink).to.equal("Hello World\n")
    })
})

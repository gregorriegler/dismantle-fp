import { expect } from "chai"
import { writer_apply, writer_of } from "./writer"

describe("Writer (Monad)", () => {
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

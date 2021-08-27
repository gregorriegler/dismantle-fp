import { expect } from "chai"
import { describe } from "mocha";

/**
 * # Phase 1
 * - create a task with name
 * - create a task with name
 * - display list of tasks
 * - tasks saved as file to disk
 *
 * # Phase 2
 * - update an existing task its name
 * - remove a task
 *
 * # Phase 3
 * - add additional description, update it
 */
describe("TaskList App", () => {

    describe("TaskList Top Level", () => {
        let originalConsole = console.log
        let output:String

        beforeEach(() => {
            originalConsole = console.log
            output = ""
            console.log = function(message?) {
                output += message
            }
        })

        afterEach(() => {
            console.log = originalConsole
        })

        it("captures console", () => {
            console.log("Hello")
            expect(output).to.eq("Hello")
        })
    })

    describe("TaskList Domain", () => {

    })
})

import { expect } from "chai"
import { describe } from "mocha";
import { task_list_app } from "./app";

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
describe("TaskList App Top Level (outside-in)", () => {
    let originalConsole = console.log
    let output: String

    beforeEach(() => {
        originalConsole = console.log
        output = ""
        console.log = function (message?) {
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

    it("starts empty", () => {
        task_list_app(["list"])
        expect(output).to.eq("Current Tasks:\n")
    })

    // create task was too big step -> go back

    it("rejects (single) invalid command", () => {
        task_list_app(["invalid-command"])
        expect(output).to.eq("Invalid Command: \"invalid-command\"\n")
    })

    it("rejects invalid commands (creates list processing)", () => {
        task_list_app(["invalid-1", "invalid-2"])
        expect(output).to.eq(
            "Invalid Command: \"invalid-1\"\n" +
            "Invalid Command: \"invalid-2\"\n"
        )
    })

    // Test list
    // * kein command

    describe("create task", () => {
        it("command exists", () => {
            task_list_app(["create foo"])
            expect(output).to.eq("")
        })

        it("creates the task (defines the design with fakes)", () => {
            task_list_app(["create foo", "list"])
            expect(output).to.eq("Current Tasks:\n( ) foo\n")
        })

        it("outputs intermediate result", () => {
            task_list_app(["create foo", "list", "create bar", "list"])
            expect(output).to.eq(
                "Current Tasks:\n( ) foo\n" +
                "Current Tasks:\n( ) foo\n( ) bar\n"
            )
        })
    })
})

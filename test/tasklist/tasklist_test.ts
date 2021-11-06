import { expect } from "chai"
import { describe } from "mocha";
import { seq_of_array } from "../seq";
import { execute_commands_by_name } from "./tasks";

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
        task_list(["list"])
        expect(output).to.eq("Current Tasks:\n")
    })

    // create task was too big step -> go back

    it("rejects (single) invalid command", () => {
        task_list(["invalid-command"])
        expect(output).to.eq("Invalid Command: \"invalid-command\"\n")
    })

    it("rejects invalid commands (creates list processing)", () => {
        task_list(["invalid-1", "invalid-2"])
        expect(output).to.eq(
            "Invalid Command: \"invalid-1\"\n" +
            "Invalid Command: \"invalid-2\"\n"
        )
    })

    // Test list
    // * kein command

    describe("create task", () => {
        it("command exists", () => {
            task_list(["create foo"])
            expect(output).to.eq("")
        })

        it("creates the task (defines the design with fakes)", () => {
            task_list(["create foo", "list"])
            expect(output).to.eq("Current Tasks:\n( ) foo\n")
        })
    })

    // TODO testcase: create foo, list (only foo), create bar, list (both)
})

/*
 * Top Level
 */
function task_list(args: string[]): void {
    const commands = seq_of_array(args);
    const writer = execute_commands_by_name(commands)
    writer(io_console_print)
}

function io_console_print(message: string): void {
    console.log(message)
}

/*
 * Gibt es einen pure Teil der nicht im Domain ist, wie zB convert von String auf Command.
 * String ist nicht in domain aber das Mapping kann pure gemacht werden.
 * Es gibt einen funktionalen Teil im Boundary auch. Der ist nicht top level.
 *
 * Es ist eine Seq von Commands die wir folden. Am Anfang wird aus Reader ein State.
 * Dann folden wir den State ueber die Commands. Am Ende wandert der State in einen Writer zum Save.
 */

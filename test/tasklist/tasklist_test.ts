import { expect } from "chai"
import { describe } from "mocha";
import { Write, Writer, writer_apply, writer_of } from "../datamunging/writer";
import { curry3 } from "../func";

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

        it("starts empty", () => {
            task_list(["list"])
            expect(output).to.eq("Current Tasks:\n")
        })
    })

    describe("TaskList Domain", () => {

    })
})

/*
 * Pure (Domain)
 */

function format_tasks() {
    const header = "Current Tasks:\n"
    const current_tasks = ""
    const formatted_task_list = header + current_tasks
    return formatted_task_list
}

function formatted_tasks_writer() {
    const formatted_task_list = format_tasks()
    const string_writer: Writer<string, string> = writer_of()
    const apply_writer = curry3(writer_apply)
    const write = apply_writer(string_writer)
    const write_formatted_task = write(formatted_task_list)
    return write_formatted_task
}

/*
 * Top Level
 */

function task_list(strings: string[]): void {
    const writer = formatted_tasks_writer()
    writer(console_print)
}

function console_print(message: string): void {
    console.log(message)
}

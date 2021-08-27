import { expect } from "chai"
import { describe } from "mocha";
import { Write, Writer, writer_apply, writer_of } from "../datamunging/writer";

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

function console_print(message: string) {
    console.log(message)
}

function format_tasks() {
    const header = "Current Tasks:\n";
    const current_tasks = "";
    const formatted_task_list = header + current_tasks;
    return formatted_task_list;
}

function formatted_tasks_writer() {
    const formatted_task_list = format_tasks();

    const writer: Writer<string, string> = writer_of()
    return (io_write:Write<string>) => { writer_apply(writer, formatted_task_list, io_write) }
}

function task_list(strings: string[]) {
    const writer = formatted_tasks_writer()
    writer(console_print)
}

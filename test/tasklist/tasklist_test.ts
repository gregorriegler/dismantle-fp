import { expect } from "chai"
import { describe } from "mocha";
import { Writer, writer_apply, writer_of, writer_map } from "../datamunging/writer";
import { curry2, curry3, F1 } from "../func";
import { Seq, seq_of_array } from "../seq";

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

        xit("creates task", () => {
            task_list(["create foo", "list"])
            expect(output).to.eq("Current Tasks:\n( ) foo\n")
            // TODO continue or find better test with smaller increment
        })
    })

    describe("TaskList Domain", () => {

    })
})

/*
 * Pure (Domain)
 */

interface FormattedTasks {
    value: string;
}

function format_tasks(): FormattedTasks {
    const header = "Current Tasks:\n"
    const current_tasks = ""
    const formatted_task_list = header + current_tasks
    return { value: formatted_task_list }
}

function formatted_tasks_to_string(fts: FormattedTasks) {
    return fts.value
}

function formatted_tasks_writer(args: Seq<string>) {
    const formatted_task_list = format_tasks()

    const string_writer: Writer<string, string> = writer_of()

    const make_writer_map = curry2(writer_map) as (t: Writer<string, string>) => F1<F1<FormattedTasks, string>, Writer<FormattedTasks, string>>
    const map_string_writer = make_writer_map(string_writer)
    const formatted_tasks_writer = map_string_writer(formatted_tasks_to_string)

    const apply_writer = curry3(writer_apply)
    const write = apply_writer(formatted_tasks_writer)
    const write_formatted_tasks = write(formatted_task_list)

    return write_formatted_tasks
}

/*
 * Top Level
 */

function task_list(args: string[]): void {
    const commands = seq_of_array(args);
    const writer = formatted_tasks_writer(commands)
    writer(console_print)
}

function console_print(message: string): void {
    console.log(message)
}

/*
 * Gibt es einen pure Teil der nicht im Domain ist, wie zB convert von String auf Command.
 * String ist nicht in domain aber das Mapping kann pure gemacht werden.
 * Es gibt einen funktionalen Teil im Boundary auch. Der ist nicht top level.
 *
 * Es ist eine Seq von Commands die wir folden. Am Anfang wird aus Reader ein State.
 * Dann folden wir den State �ber die Commands. Am Ende wandert der State in einen Writer zum Save.
 */
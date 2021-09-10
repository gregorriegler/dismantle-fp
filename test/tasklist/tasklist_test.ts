import { expect } from "chai"
import { describe } from "mocha";
import {
    create_apply_for_writer,
    writer_of, Write
} from "../datamunging/writer";
import { Seq, seq_of_array } from "../seq";
import { F1 } from "../func";

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

function formatted_tasks_writer(args: Seq<string>): F1<Write<string>, void> {
    const formatted_tasks_writer = writer_of(formatted_tasks_to_string);
    const apply_formatted_tasks_writer = create_apply_for_writer(formatted_tasks_writer)

    const formatted_task_list = format_tasks()
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)

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
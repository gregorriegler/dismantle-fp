import { expect } from "chai"
import { describe } from "mocha";
import {
    create_apply_for_writer,
    writer_of, Write
} from "../datamunging/writer";
import { Seq, seq_first, seq_of_array } from "../seq";
import { F1, lazy } from "../func";
import { Maybe, maybe_flat_map, maybe_map, maybe_none, maybe_of, maybe_value } from "../maybe_union";
import { fail } from "assert";

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

    describe("TaskList Top Level (outside-in)", () => {
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

        xit("rejects (single) invalid command", () => {
            task_list(["invalid-command"])
            expect(output).to.eq("Invalid Command: \"invalid-command\"\n")
        })

        // Test list
        // * multiple commands ["invalid-command", "list"]
        // * kein command

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

type Command = (args: Seq<string>) => F1<Write<string>, void>

function formatted_tasks_writer(args: Seq<string>): F1<Write<string>, void> {
    const formatted_tasks_writer = writer_of(formatted_tasks_to_string);
    const apply_formatted_tasks_writer = create_apply_for_writer(formatted_tasks_writer)

    const formatted_task_list = format_tasks()
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)

    return write_formatted_tasks
}

function execute_commands(commands: Seq<string>): F1<Write<string>, void> {
    const lookup: { [name: string]: Command } = { "list": formatted_tasks_writer }
    const command = seq_first(commands).head
    const mapped_commands: Maybe<F1<Write<string>, void>> = maybe_flat_map(command, c => {
        const x = lookup[c];
        if (x) {
            return maybe_of(x(commands))
        }
        else return maybe_none()
    })
    return maybe_value(mapped_commands, () => fail("should not be called"))
}

/*
 * Top Level
 */

function task_list(args: string[]): void {
    const commands = seq_of_array(args);
    const writer = execute_commands(commands)
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
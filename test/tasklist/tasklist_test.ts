import { expect } from "chai"
import { describe } from "mocha";
import { create_apply_writer_for_transformation, Write } from "../datamunging/writer";
import { Seq, seq_fold, seq_map, seq_maybe_first_value, seq_of_array, seq_of_empty, seq_of_singleton } from "../seq";
import { F1, identity1, lazy } from "../func";
import { Maybe, maybe_map, maybe_value } from "../maybe_union";
import { Map, map_get, map_of_2 } from "./map";

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

    // tasks create
    // tasks add
    // tasks format
    describe("TaskList Domain", () => {
        it("formats empty Tasks", () => {
            const tasks = tasks_create()
            const formatted_tasks = tasks_format(tasks);

            expect(formatted_tasks.value).to.eq("Current Tasks:\n")
        })

        it("adds a Task", () => {
            const tasks = tasks_create()

            const result = tasks_add(tasks, "Buy a Milk");

            const formatted_tasks = tasks_format(result);
            expect(formatted_tasks.value).to.eq("Current Tasks:\n( ) Buy a Milk\n")
        })
    })
})

/*
 * Pure (Domain)
 */

type Tasks = {
    elements: Seq<string>
}

function tasks_create(): Tasks {
    return {elements: seq_of_empty()}
}

// named pair of Tasks and lazy Write
type CommandResult = {
    new_tasks: Tasks,
    output: F1<Write<string>, void>
}

type Command = (args: Seq<string>, tasks: Tasks) => CommandResult

interface FormattedTasks {
    value: string;
}

// TODO move to writer
// TODO need type 'WriterApply' in writer for F1<Write<string>, void>
function combiner(a: F1<Write<string>, void>, b: F1<Write<string>, void>): F1<Write<string>, void> {
    return (write) => {
        a(write)
        b(write)
    }
}

function execute_commands_by_name(command_names: Seq<string>): F1<Write<string>, void> {
    let tasks = tasks_create() // maybe create as first command
    // TODO let is mutation
    const seq: Seq<F1<Write<string>, void>> = seq_map(command_names, command_name => {
        // TODO constraints, no anonymous function
        const command = command_by_name(command_name)
        const current_command = seq_of_singleton(command_name);
        const executed_command = maybe_map(command, f => f(current_command, tasks))
        const foo = maybe_value(executed_command, lazy(invalid_command_writer(current_command, tasks)))
        tasks = foo.new_tasks
        return foo.output
    })

    return seq_fold(seq, combiner, _ => {
    })
}

function command_by_name(name: string): Maybe<Command> {
    const lookup: Map<Command> = map_of_2("list", formatted_tasks_writer,
        "create foo", add_task)
    return map_get(lookup, name)
}

function add_task(args: Seq<string>, tasks: Tasks): CommandResult {
    return {
        new_tasks: tasks_add(tasks, "foo"), // TODO add more tasks
        output: (w) => {
        }
    }
}

// list command
function formatted_tasks_writer(args: Seq<string>, tasks: Tasks): CommandResult {
    const apply_formatted_tasks_writer = create_apply_writer_for_transformation(formatted_tasks_to_string);

    const formatted_task_list = tasks_format(tasks)
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)

    return {
        new_tasks: tasks,
        output: write_formatted_tasks
    }
}

function invalid_command_writer(args: Seq<string>, tasks: Tasks): CommandResult {
    const identity = identity1 as F1<string, string>;
    const apply_invalid_command_writer = create_apply_writer_for_transformation(identity)

    const command_name = seq_maybe_first_value(args, lazy("no command given"));
    const formatted_invalid_command = "Invalid Command: \"" + command_name + "\"\n"
    const write_invalid_command = apply_invalid_command_writer(formatted_invalid_command)

    return {
        new_tasks: tasks,
        output: write_invalid_command
    }
}

function formatted_tasks_to_string(fts: FormattedTasks) {
    return fts.value
}

function tasks_format(tasks: Tasks): FormattedTasks {
    const header = "Current Tasks:\n"
    const formatted_tasks = seq_map(tasks.elements, task_format)
    const formatted_task_list = header + seq_fold(formatted_tasks, joinStrings, "")
    return {value: formatted_task_list}
}

function task_format(task: string) {
    return "( ) " + task + "\n";
}

function joinStrings(a: string, b: string) {
    return a + b;
}

function tasks_add(tasks: Tasks, new_task: string): Tasks {
    return {elements: seq_of_singleton(new_task)}
}

/*
 * Top Level
 */

function task_list(args: string[]): void {
    const commands = seq_of_array(args);
    const writer = execute_commands_by_name(commands)
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
 * Dann folden wir den State über die Commands. Am Ende wandert der State in einen Writer zum Save.
 */

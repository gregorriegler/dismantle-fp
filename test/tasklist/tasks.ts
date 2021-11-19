import { create_apply_writer_for_transformation } from "../datamunging/writer"
import { Seq, seq_fold, seq_join, seq_map, seq_of_empty, seq_of_singleton } from "../seq"
import { curry2, F1, identity1, join, lazy } from "../func"
import { maybe_map, maybe_value } from "../maybe_union"
import { Map, map_get, map_of_2 } from "./map"
import { null_write, sequence_writes as write_in_sequence, WriteApplied } from "../datamunging/write"

/*
 * Pure (Domain) is most inner.
 */

type TaskName = string // prob. need a wrapper Task for this to contain additional state like "completed"
type Task = TaskName
type Tasks = Seq<Task>
type FormattedTasks = string

export function task_create(name: TaskName): Task {
    return name
}

export function tasks_create(): Tasks {
    return seq_of_empty()
}

const tasks_adder = curry2(tasks_add)

export function tasks_add(tasks: Tasks, new_task: Task): Tasks {
    return seq_join(tasks, seq_of_singleton(new_task))
}

export function tasks_format(tasks: Tasks): FormattedTasks {
    const header = "Current Tasks:\n"
    const formatted_tasks = seq_map(tasks, task_format)
    return header + seq_fold(formatted_tasks, join, "")
}

function task_format(task: Task): string {
    const open = "( ) ";
    const next = "\n";
    return open + task + next
}

/*
 * Pure (what kind of code?)
 */

// named pair of Tasks and lazy Write

type ApplicationState = {
    tasks: Tasks,
    write: WriteApplied<string>
}

export function application_state_create(): ApplicationState {
    return {
        tasks: tasks_create(),
        write: null_write
    }
}

type Command = (state: ApplicationState) => ApplicationState

export function task_list(command_names: Seq<UserInput>): WriteApplied<string> {
    const commands = seq_map(command_names, command_from_input);
    const state = seq_fold(commands, commands_fold, application_state_create())
    return state.write
}

function commands_fold(current_state: ApplicationState, command: Command): ApplicationState {
    const new_state = command(current_state)
    return {
        tasks: new_state.tasks, // we drop the old state
        write: write_in_sequence(current_state.write, new_state.write)
    }
}

// --- Templates ---

export type UserInput = string
type CommandTemplate = (state: ApplicationState, argument: string) => ApplicationState

export function command_from_input(user_input: UserInput): Command {
    const template_lookup: Map<CommandTemplate> = map_of_2( //
        "list", list_tasks, //
        "create", add_task, //
    )

    const input_parts = user_input.split(' ', 2)
    const name = input_parts[0]
    const argument = input_parts[1]

    const template = map_get(template_lookup, name)
    const command = maybe_map(template, t => command_create(t, argument))

    const invalid_command = command_create(write_invalid_command, user_input);

    return maybe_value(command, lazy(invalid_command))
}

function command_create(template: CommandTemplate, argument: string): Command {
    return state => template(state, argument)
}

function add_task(state: ApplicationState, task_name: string): ApplicationState {
    const task = task_create(task_name);
    const add = tasks_adder(state.tasks);
    return {
        tasks: add(task),
        write: null_write
    }
}

function list_tasks(state: ApplicationState, _: string): ApplicationState {
    const apply_formatted_tasks_writer = create_apply_writer_for_transformation(identity1) // TODO I think this is what new_writer should be doing

    const formatted_task_list = tasks_format(state.tasks)
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)

    return {
        tasks: state.tasks,
        write: write_formatted_tasks
    }
}

function format_invalid_command_name(command_name: string) {
    const header = "Invalid Command: \"";
    const footer = "\"\n";
    return header + command_name + footer;
}

function write_invalid_command(state: ApplicationState, command_name: string): ApplicationState {
    const identity = identity1 as F1<string, string>
    const apply_invalid_command_writer = create_apply_writer_for_transformation(identity)

    const formatted_invalid_command = format_invalid_command_name(command_name)
    const write_invalid_command = apply_invalid_command_writer(formatted_invalid_command)

    return {
        tasks: state.tasks,
        write: write_invalid_command
    }
}

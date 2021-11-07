import { create_apply_writer_for_transformation } from "../datamunging/writer"
import {
    Seq,
    seq_fold,
    seq_join,
    seq_map,
    seq_of_empty,
    seq_of_singleton
} from "../seq"
import { F1, identity1, join, lazy } from "../func"
import { Maybe, maybe_map, maybe_value } from "../maybe_union"
import { Map, map_get, map_of_2 } from "./map"
import { null_write, sequence_writes as write_in_sequence, Write, WriteApplied } from "../datamunging/write"

/*
 * Pure (Domain)
 */

type TaskName = string // prob. need a wrapper Task for this to contain additional state like "completed"

type Tasks = Seq<TaskName>

export function tasks_create(): Tasks {
    return seq_of_empty()
}

export function tasks_add(tasks: Tasks, new_task: TaskName): Tasks {
    return seq_join(tasks, seq_of_singleton(new_task))
}

export function tasks_format(tasks: Tasks): FormattedTasks {
    const header = "Current Tasks:\n"
    const formatted_tasks = seq_map(tasks, task_format)
    const formatted_task_list = header + seq_fold(formatted_tasks, join, "")
    return { value: formatted_task_list }
}

function task_format(task: TaskName) {
    return "( ) " + task + "\n"
}

interface FormattedTasks {
    value: string
}

function formatted_tasks_to_string(fts: FormattedTasks) {
    return fts.value
}

// named pair of Tasks and lazy Write

type ApplicationState = {
    tasks: Tasks,
    write: WriteApplied<string>
}

type Command = (command_name: string, state: ApplicationState) => ApplicationState

export function execute_commands_by_name(command_names: Seq<string>): WriteApplied<string> {
    const state: ApplicationState = seq_fold(
        command_names,
        (current_state: ApplicationState, command_name: string): ApplicationState => {
            const command = command_by_name(command_name)
            const executed_command = maybe_map(command, f => f(command_name, current_state))
            const new_state: ApplicationState = maybe_value(executed_command, lazy(command_invalid(command_name, current_state)))
            return {
                tasks: new_state.tasks, // we drop the old state
                write: write_in_sequence(current_state.write, new_state.write)
            }
        },
        {
            tasks: tasks_create(),
            write: () => { }
        }
    )
    return state.write
}

function command_by_name(command_name: string): Maybe<Command> {
    const lookup: Map<Command> = map_of_2( //
        "list", command_list, //
        "create foo", command_add_task, //
    )
    return map_get(lookup, command_name)
}

function command_add_task(command_name: string, state: ApplicationState): ApplicationState {
    return {
        tasks: tasks_add(state.tasks, "foo"), // TODO add more tasks
        write: null_write
    }
}

function command_list(_: string, state: ApplicationState): ApplicationState {
    const apply_formatted_tasks_writer = create_apply_writer_for_transformation(formatted_tasks_to_string)

    const formatted_task_list = tasks_format(state.tasks)
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)

    return {
        tasks: state.tasks,
        write: write_formatted_tasks
    }
}

function command_invalid(command_name: string, state: ApplicationState): ApplicationState {
    const identity = identity1 as F1<string, string>
    const apply_invalid_command_writer = create_apply_writer_for_transformation(identity)

    const formatted_invalid_command = "Invalid Command: \"" + command_name + "\"\n"
    const write_invalid_command = apply_invalid_command_writer(formatted_invalid_command)

    return {
        tasks: state.tasks,
        write: write_invalid_command
    }
}

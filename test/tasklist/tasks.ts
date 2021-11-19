import { create_apply_writer_for_transformation } from "../datamunging/writer"
import { Seq, seq_fold, seq_join, seq_map, seq_of_empty, seq_of_singleton } from "../seq"
import { curry2, F1, identity1, join, lazy} from "../func"
import { maybe_map, maybe_value } from "../maybe_union"
import { Map, map_get, map_of_2 } from "./map"
import { null_write, sequence_writes as write_in_sequence, WriteApplied } from "../datamunging/write"

/*
 * Pure (Domain)
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
    return "( ) " + task + "\n"
}

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

type CommandAction = (state: ApplicationState, argument: string) => ApplicationState

// TODO: everything is a command
type Command = {
    action: CommandAction,
    argument: string
}

export function task_list(command_names: Seq<string>): WriteApplied<string> {
    const commands = seq_map(command_names, command_by_name);
    const state: ApplicationState = seq_fold(commands, commands_fold, application_state_create())
    return state.write
}

function commands_fold(current_state: ApplicationState, command: Command): ApplicationState {
    const command_f = executing_command(command);
    const new_state = command_f(current_state)
    return {
        tasks: new_state.tasks, // we drop the old state
        write: write_in_sequence(current_state.write, new_state.write)
    }
}

const executing_command = curry2(command_execute)

export function command_execute(command: Command, current_state: ApplicationState): ApplicationState {
    return command.action(current_state, command.argument);
}

export function command_by_name(command_name: string): Command {
    const command_parts = command_name.split(' ')
    const lookup: Map<CommandAction> = map_of_2( //
        "list", state_list_tasks, //
        "create", state_add_task, //
    )
    const maybe_action = map_get(lookup, command_parts[0])
    const maybe_command = maybe_map(maybe_action, action => {
        return {action: action, argument: command_parts[1]}
    })
    const invalid_command = lazy({action: state_write_invalid_command, argument: command_name})
    return maybe_value(maybe_command, invalid_command)
}

function state_add_task(state: ApplicationState, task_name: string): ApplicationState {
    return {
        tasks: tasks_adder(state.tasks)(task_create(task_name)),
        write: null_write
    }
}

function state_list_tasks(state: ApplicationState, _: string): ApplicationState {
    const apply_formatted_tasks_writer = create_apply_writer_for_transformation(identity1) // TODO I think this is what new_writer should be doing

    const formatted_task_list = tasks_format(state.tasks)
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)

    return {
        tasks: state.tasks,
        write: write_formatted_tasks
    }
}

function state_write_invalid_command(state: ApplicationState, command_name: string): ApplicationState {
    const identity = identity1 as F1<string, string>
    const apply_invalid_command_writer = create_apply_writer_for_transformation(identity)

    const formatted_invalid_command = "Invalid Command: \"" + command_name + "\"\n"
    const write_invalid_command = apply_invalid_command_writer(formatted_invalid_command)

    return {
        tasks: state.tasks,
        write: write_invalid_command
    }
}

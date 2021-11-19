import { null_write, WriteApplied } from "../datamunging/write";
import { create_apply_writer_for_transformation } from "../datamunging/writer";
import { F1, identity1 } from "../func";
import { Tasks, tasks_adder, tasks_create, tasks_format, task_create } from "./tasks";

/*
 * ? = Pure (Application)
 */

// named pair of Tasks and lazy Write
export type ApplicationState = {
    tasks: Tasks,
    write: WriteApplied<string>
}

export function application_state_create(): ApplicationState {
    return {
        tasks: tasks_create(),
        write: null_write
    }
}

export function add_task(state: ApplicationState, task_name: string): ApplicationState {
    const task = task_create(task_name);
    const add = tasks_adder(state.tasks);
    return {
        tasks: add(task),
        write: null_write
    }
}

export function list_tasks(state: ApplicationState, _: string): ApplicationState {
    const apply_formatted_tasks_writer = create_apply_writer_for_transformation(identity1) // TODO I think this is what new_writer should be doing

    const formatted_task_list = tasks_format(state.tasks)
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)

    return {
        tasks: state.tasks,
        write: write_formatted_tasks
    }
}

export function write_invalid_command(state: ApplicationState, command_name: string): ApplicationState {
    const identity = identity1 as F1<string, string>
    const apply_invalid_command_writer = create_apply_writer_for_transformation(identity)

    const formatted_invalid_command = format_invalid_command_name(command_name)
    const write_invalid_command = apply_invalid_command_writer(formatted_invalid_command)

    return {
        tasks: state.tasks,
        write: write_invalid_command
    }
}

function format_invalid_command_name(command_name: string) {
    const header = "Invalid Command: \"";
    const footer = "\"\n";
    return header + command_name + footer;
}

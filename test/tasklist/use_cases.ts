import { null_write, WriteApplied } from "../datamunging/write"
import { create_apply_writer_for_transformation } from "../datamunging/writer"
import { F0, F1, F2, identity1, lazy } from "../func"
import { Pair, pair_map, pair_of, Single } from "./pair"
import { task_adder, Tasks, tasks_create, tasks_format } from "./tasks"

/*
 * ? = Pure (Application)
 */

export type ApplicationState = Pair<'tasks', Tasks, 'write', WriteApplied<string>>

export function application_state_create(): ApplicationState {
    return pair_of(
        'tasks', tasks_create(),
        'write', null_write
    )
}

// export function add_task(state: ApplicationState, task_name: string): ApplicationState {
export function add_task<K1, K2, V2>(state: Single<K1, Tasks>, task_name: string):
        Pair<K1, Tasks, K2, WriteApplied<V2>> {
    return pair_map(state, task_adder(task_name), lazy(null_write))
}

// export function list_tasks(state: ApplicationState, _: string): ApplicationState {
export function list_tasks<K1, K2, V2>(state: Pair<K1, Tasks, K2, WriteApplied<V2>>, _: string):
        Pair<K1, Tasks, K2, WriteApplied<string>> {
    return pair_map(state, identity1, tasks_writer)
}

function tasks_writer(tasks: Tasks): WriteApplied<string> {
    const formatted_task_list = tasks_format(tasks)
    const apply_formatted_tasks_writer = create_apply_writer_for_transformation(identity1) // TODO I think this is what new_writer should be doing
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)
    return write_formatted_tasks
}

// export function write_invalid_command(state: ApplicationState, command_name: string): ApplicationState {
export function write_invalid_command<K1, V1, K2>(state: Pair<K1, V1, K2, WriteApplied<string>>, command_name: string):
        Pair<K1, V1, K2, WriteApplied<string>> {
    return pair_map(state, identity1, create_map_writer_to_invalid_command_writer_for(command_name))
}

//function create_map_writer_to_invalid_command_writer_for<V1, V2>(command_name: string): F2<V1, V2, WriteApplied<string>> {
//    function map_writer_to_invalid_command_writer(v1: V1, v2: V2) {
function create_map_writer_to_invalid_command_writer_for(command_name: string): F0<WriteApplied<string>> {
    function map_writer_to_invalid_command_writer() {
        const identity = identity1 as F1<string, string>
        const apply_invalid_command_writer = create_apply_writer_for_transformation(identity)

        const formatted_invalid_command = format_invalid_command_name(command_name)
        const write_invalid_command = apply_invalid_command_writer(formatted_invalid_command)
        return write_invalid_command
    }
    return map_writer_to_invalid_command_writer
}

function format_invalid_command_name(command_name: string) {
    const header = "Invalid Command: " + "\""
    const footer = "\"" + "\n"
    return header + command_name + footer
}

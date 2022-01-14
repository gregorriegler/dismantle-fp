import { null_write, WriteApplied } from "../datamunging/write"
import { create_apply_writer_for_transformation } from "../datamunging/writer"
import { F1, identity1 } from "../func"
import { task_adder, Tasks, tasks_create, tasks_format } from "./tasks"

/*
 * ? = Pure (Application)
 */

type Pair<L_NAME extends string, L, R_NAME extends string, R> = {
    [key in L_NAME]: L
} & { // & = intersection type
    [key in R_NAME]: R
} & { // TODO hide these fields from outside
    _l_name: L_NAME
    _r_name: R_NAME
}

export function pair_of<L_NAME extends string, L, R_NAME extends string, R>(
    left_name: L_NAME,
    left: L,
    right_name: R_NAME,
    right: R
): Pair<L_NAME, L, R_NAME, R> {
    return {
        [left_name]: left,
        [right_name]: right,
        _l_name: left_name,
        _r_name: right_name
    } as Pair<L_NAME, L, R_NAME, R>
}

function pair_map_left<L_NAME extends string, L, NEW_L, R_NAME extends string, R>(
    pair: Pair<L_NAME, L, R_NAME, R>,
    map: (l: L) => NEW_L
) {
    return pair_of(
        pair._l_name,
        map(pair[pair._l_name]),
        pair._r_name,
        pair[pair._r_name]
    )
}

function pair_map_right<L_NAME extends string, L, R_NAME extends string, R, NEW_R>(
    pair: Pair<L_NAME, L, R_NAME, R>,
    map: (r: R) => NEW_R
) {
    return pair_of(
        pair._l_name,
        pair[pair._l_name],
        pair._r_name,
        map(pair[pair._r_name])
    )
}

export type ApplicationState = Pair<'tasks', Tasks, 'write', WriteApplied<string>>

export function application_state_create(): ApplicationState {
    return pair_of(
        'tasks', tasks_create(),
        'write', null_write
    );
}

export function add_task(state: ApplicationState, task_name: string): ApplicationState {
    const added_task = pair_map_left(state, task_adder(task_name));
    return pair_map_right(added_task, _ => {
        return null_write;
    })
}

export function list_tasks(state: ApplicationState, _: string): ApplicationState {
    const apply_formatted_tasks_writer = create_apply_writer_for_transformation(identity1) // TODO I think this is what new_writer should be doing

    const formatted_task_list = tasks_format(state.tasks)
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)

    return pair_of(
        'tasks', state.tasks,
        'write', write_formatted_tasks
    );
}

export function write_invalid_command(state: ApplicationState, command_name: string): ApplicationState {
    const identity = identity1 as F1<string, string>
    const apply_invalid_command_writer = create_apply_writer_for_transformation(identity)

    const formatted_invalid_command = format_invalid_command_name(command_name)
    const write_invalid_command = apply_invalid_command_writer(formatted_invalid_command)

    return pair_of(
        'tasks', state.tasks,
        'write', write_invalid_command
    );
}

function format_invalid_command_name(command_name: string) {
    const header = "Invalid Command: " + "\""
    const footer = "\"" + "\n"
    return header + command_name + footer
}

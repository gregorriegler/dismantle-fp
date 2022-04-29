import { null_write, WriteApplied } from "../datamunging/write"
import { make_apply_writer, make_apply_writer_to_transformation } from "../datamunging/writer"
import { F0, F1, identity1, lazy } from "../func"
import { Pair, pair_lift, pair_map, pair_of } from "./pair"
import { make_add_task_by_name, Tasks, tasks_create, tasks_format } from "./tasks"

/*
 * Domain Logic = Pure (Application)
 */

export type ApplicationState = Pair<Tasks, WriteApplied<string>>

export function application_state_create(): ApplicationState {
    return pair_of(tasks_create(), null_write)
}

export function application_state_map_add_task<V2>(concrete_task_name: string): F1<Pair<Tasks, WriteApplied<V2>>, Pair<Tasks, WriteApplied<V2>>> {
    // was kann ich öfter verwenden?
    // wir haben das: task_adder(task_name)(tasks)
    // ... kann selben Task zu verschiedenen Listen hinzufügen
    // ... kann ich öfter verwenden
    // Gregor will: tasks_addable(tasks)(task_from(task_name))
    // ... kann von einer base Liste unterschiedliche Ableitungen/Varianten mit unterschiedlichen Tasks erstellen
    // ... wäre mehr OO, weil this das erste ist
    const add_concrete_task = make_add_task_by_name(concrete_task_name)
    return pair_lift(add_concrete_task, lazy(null_write))
}

export function list_tasks<V2>(_: string): F1<Pair<Tasks, WriteApplied<V2>>, Pair<Tasks, WriteApplied<string>>> {
    return (state: Pair<Tasks, WriteApplied<V2>>) => pair_map(state, identity1, tasks_writer)
}

function tasks_writer(tasks: Tasks): WriteApplied<string> {
    const formatted_task_list = tasks_format(tasks)
    const apply_formatted_tasks_writer = make_apply_writer<string>()
    const write_formatted_tasks = apply_formatted_tasks_writer(formatted_task_list)
    return write_formatted_tasks
}

export function write_invalid_command<V1>(command_name: string): F1<Pair<V1, WriteApplied<string>>, Pair<V1, WriteApplied<string>>> {
    const mapR = create_map_writer_to_invalid_command_writer_for(command_name)
    return (state) => pair_map(state, identity1, mapR)
}

function create_map_writer_to_invalid_command_writer_for(command_name: string): F0<WriteApplied<string>> {
    function map_writer_to_invalid_command_writer() {
        const identity = identity1 as F1<string, string>
        const apply_invalid_command_writer = make_apply_writer_to_transformation(identity)

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

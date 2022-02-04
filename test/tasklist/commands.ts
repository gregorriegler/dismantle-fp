import { Seq, seq_fold, seq_map } from "../seq"
import { identity1, lazy } from "../func"
import { maybe_map, maybe_value } from "../maybe_union"
import { Map, map_get, map_of_2 } from "./map"
import { sequence_writes as write_in_sequence, WriteApplied } from "../datamunging/write"
import {
    add_task,
    ApplicationState,
    application_state_create,
    list_tasks,
    write_invalid_command
} from "./use_cases"
import { Pair, pair_map } from "./pair"

/*
 * Gibt es einen pure Teil der nicht im Domain ist, wie zB convert von String auf Command.
 * String ist nicht in Domain aber das Mapping kann pure gemacht werden.
 * Es gibt einen funktionalen Teil im Boundary auch. Der ist nicht top level.
 *
 * Es ist eine Seq von Commands die wir folden. Am Anfang wird aus Reader ein State.
 * Dann folden wir den State ueber die Commands. Am Ende wandert der State in einen Writer zum Save.
 */

type CommandX<K1, V1, K2, V2, K3, V3, K4, V4> = (state: Pair<K1, V1, K2, WriteApplied<V2>>) => Pair<K3, V3, K4, WriteApplied<V4>>
type Command = (state: ApplicationState) => ApplicationState

export function task_list(command_names: Seq<UserInput>): WriteApplied<string> {
    const commands = seq_map(command_names, command_from_input)
    const state = seq_fold(commands, commands_fold, application_state_create())
    return state.write // this is the only time we use the K2, don't use K1 at all.
}

// function commands_fold(current_state: ApplicationState, command: Command): ApplicationState {
function commands_fold<K1, V1, K2, V2, K3, V3, K4>(current_state: Pair<K1, V1, "write", WriteApplied<V2>>,
        command: CommandX<K1, V1, K2, V2, K3, V3, "write", V2>):
        Pair<K3, V3, K4, WriteApplied<V2>> {
    const new_state = command(current_state)
    const merged_write = write_in_sequence(current_state.write, new_state.write)
    return pair_map(new_state, identity1, lazy(merged_write))
}

export type UserInput = string
type CommandTemplate = (state: ApplicationState, argument: string) => ApplicationState

export function command_from_input(user_input: UserInput): Command {
    const template_lookup: Map<CommandTemplate> = map_of_2( //
        "list", list_tasks, //
        "create", add_task, //
    )

    const input_parts = user_input.split(" ", 2)
    const name = input_parts[0]
    const argument = input_parts[1]

    const template = map_get(template_lookup, name)
    const command = maybe_map(template, t => command_create(t, argument))

    const invalid_command = command_create(write_invalid_command, user_input)

    return maybe_value(command, lazy(invalid_command))
}

function command_create(template: CommandTemplate, argument: string): Command {
    return state => template(state, argument)
}

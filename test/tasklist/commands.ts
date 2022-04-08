import { Seq, seq_fold, seq_map } from "../seq"
import { identity1, lazy } from "../func"
import { maybe_map_i, maybe_value } from "../maybe_union"
import { Map, map_get, map_of_2 } from "./map"
import { sequence_writes as write_in_sequence, WriteApplied } from "../datamunging/write"
import { application_state_map_add_task, application_state_create, ApplicationState, list_tasks, write_invalid_command } from "./use_cases"
import { Pair, pair_map } from "./pair"

type CommandX<V1, V2, V3, V4> = (state: Pair<V1, WriteApplied<V2>>) => Pair<V3, WriteApplied<V4>>
type Command = (state: ApplicationState) => ApplicationState

export function task_list(command_input: Seq<UserInput>): WriteApplied<string> {
    const commands = seq_map(command_input, command_from_input)
    const state = seq_fold(commands, commands_fold, application_state_create())
    return state["right"] // this is the only time we use the K2, don't use K1 at all.
}

// function commands_fold(current_state: ApplicationState, command: Command): ApplicationState {
function commands_fold<V1, V2, V3>(current_state: Pair<V1, WriteApplied<V2>>, command: CommandX<V1, V2, V3, V2>):
    Pair<V3, WriteApplied<V2>> {
    // works with domain objects, folds domain
    const new_state = command(current_state)
    const merged_write = write_in_sequence(current_state.right, new_state.right)
    return pair_map(new_state, identity1, lazy(merged_write))
}

export type UserInput = string

type CommandTemplate = (argument: string) => Command

export function command_from_input(user_input: UserInput): Command {
    // this is boundary, low level code
    const template_lookup: Map<CommandTemplate> = map_of_2( //
        "list", list_tasks, //
        "create", application_state_map_add_task, //
    )

    const input_parts = user_input.split(" ", 2)
    const name = input_parts[0]
    const argument = input_parts[1]

    const template = map_get(template_lookup, name)

    const command = maybe_map_i<CommandTemplate, Command>(template)(apply_with_argument(argument))

    const invalid_command = write_invalid_command(user_input)
    return maybe_value(command, lazy(invalid_command))
}

function apply_with_argument(argument: string) {
    return (template: CommandTemplate) => template(argument)
}

import { Seq, seq_make_fold_by, seq_lift } from "../seq"
import { F1, identity1, lazy, make_apply } from "../func"
import { maybe_make_or, maybe_lift } from "../maybe_union"
import { Map, map_get, map_of_2 } from "./map"
import { sequence_writes as write_in_sequence, WriteApplied } from "../datamunging/write"
import { application_state_map_add_task, application_state_create, ApplicationState, list_tasks, write_invalid_command } from "./use_cases"
import { Pair, pair_map } from "./pair"

type CommandX<V1, V2, V3, V4> = (state: Pair<V1, WriteApplied<V2>>) => Pair<V3, WriteApplied<V4>>
type Command = (state: ApplicationState) => ApplicationState

export function task_list(command_input: Seq<UserInput>): WriteApplied<string> {
    const initial_state = application_state_create()

    const command_from_input_map = seq_lift(command_from_input)
    const commands = command_from_input_map(command_input)

    const new_state = fold_commands_by_execute(commands, initial_state)

    return new_state["right"] // this is the only time we use the K2, don't use K1 at all.
}

const fold_commands_by_execute = seq_make_fold_by<Command, ApplicationState>(execute_command)

// function commands_fold(current_state: ApplicationState, command: Command): ApplicationState {
function execute_command<V1, V2, V3>(current_state: Pair<V1, WriteApplied<V2>>, command: CommandX<V1, V2, V3, V2>):
    Pair<V3, WriteApplied<V2>> {
    // works with domain objects, folds domain
    const new_state = command(current_state)
    const merged_write = write_in_sequence(current_state.right, new_state.right)
    return pair_map(new_state, identity1, lazy(merged_write))
}

export type UserInput = string

type CommandTemplate = F1<string, Command>

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

    const apply_argument = make_apply<string, Command>(argument)
    const apply_argument_to_template = maybe_lift<CommandTemplate, Command>(apply_argument)
    const command = apply_argument_to_template(template)

    const invalid_command = write_invalid_command(user_input)
    const command_or_invalid_command = maybe_make_or(lazy(invalid_command))
    return command_or_invalid_command(command)
}

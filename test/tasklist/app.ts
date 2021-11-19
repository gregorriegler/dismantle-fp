import { seq_of_array } from "../seq";
import { task_list, UserInput } from "./commands";

/*
 * Top Level
 */
export function task_list_app(args: UserInput[]): void {
    const commands = seq_of_array(args);
    const writer = task_list(commands)
    writer(io_console_print)
}

function io_console_print(message: string): void {
    console.log(message)
}

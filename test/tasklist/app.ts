import { seq_of_array } from "../seq"
import { task_list, UserInput } from "./commands"

/*
 * Top Level, enthält impure Code (Writer).
 */
export function task_list_app(args: UserInput[]): void {
    const command_input = seq_of_array(args)
    const writer = task_list(command_input)
    writer(io_console_print)
}

function io_console_print(message: string): void {
    console.log(message)
}

function main() {
    task_list_app(process.argv.slice(2));
}

if (require.main === module) {
    main();
}

import { Seq, seq_fold, seq_join, seq_map, seq_of_empty, seq_of_singleton } from "../seq"
import { curry2, join } from "../func"

/*
 * Model = Pure (Domain) is most inner.
 */

type TaskName = string // prob. need a wrapper Task for this to contain additional state like "completed"
type Task = TaskName
export type Tasks = Seq<Task>
type FormattedTasks = string

export function task_create(name: TaskName): Task {
    return name
}

export function tasks_create(): Tasks {
    return seq_of_empty()
}

export const tasks_adder = curry2(tasks_add)

export function tasks_add(tasks: Tasks, new_task: Task): Tasks {
    return seq_join(tasks, seq_of_singleton(new_task))
}

export function tasks_format(tasks: Tasks): FormattedTasks {
    const header = "Current Tasks:\n"
    const formatted_tasks = seq_map(tasks, task_format)
    return header + seq_fold(formatted_tasks, join, "")
}

function task_format(task: Task): string {
    const open = "( ) "
    const next = "\n"
    return open + task + next
}

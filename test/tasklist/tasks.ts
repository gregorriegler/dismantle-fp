import { Seq, seq_lift, seq_make_append_by, seq_make_fold_by, seq_of_empty, seq_of_singleton } from "../seq"
import { F1, join } from "../func"

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

export function make_add_task_by_name(task_name: string): F1<Tasks, Tasks> {
    return (tasks: Tasks) => {
        const task = task_create(task_name)
        const add_task_to = seq_make_append_by(seq_of_singleton(task))
        return add_task_to(tasks)
    }
}

export function tasks_format(tasks: Tasks): FormattedTasks {
    const header = "Current Tasks:\n"

    const map_tasks_by_format = seq_lift(task_format)
    const formatted_tasks = map_tasks_by_format(tasks)

    const concatenate = seq_make_fold_by(join)
    return header + concatenate(formatted_tasks, "")
}

function task_format(task: Task): string {
    const open = "( ) "
    const next = "\n"
    return open + task + next
}

import { expect } from "chai"
import { describe } from "mocha"
import { null_write } from "../datamunging/write"
import { expect_seq_n_values } from "../seq_expects"
import { command_by_name, tasks_add, tasks_create, tasks_format } from "./tasks"

describe("TaskList Domain", () => {
    it("formats empty Tasks", () => {
        const tasks = tasks_create()
        const formatted_tasks = tasks_format(tasks)

        expect(formatted_tasks).to.eq("Current Tasks:\n")
    })

    it("adds a Task", () => {
        const tasks = tasks_create()

        const result = tasks_add(tasks, "Buy a Milk")

        const formatted_tasks = tasks_format(result)
        expect(formatted_tasks).to.eq("Current Tasks:\n( ) Buy a Milk\n")
    })

    it("adds two Tasks", () => {
        let tasks = tasks_create()

        tasks = tasks_add(tasks, "Buy a Milk")
        const result = tasks_add(tasks, "Buy Coffee")

        const formatted_tasks = tasks_format(result)
        expect(formatted_tasks).to.eq(
            "Current Tasks:\n" +
            "( ) Buy a Milk\n" +
            "( ) Buy Coffee\n"
        )
    })
})

describe("TaskList Commands", () => {
    describe("Add Task", () => {
        xit("adds a Task", () => {
            const command = command_by_name("create bar")

            const new_state = command.action({
                tasks: tasks_create(),
                write: null_write
            }, command.name)

            const result = new_state.tasks
            expect_seq_n_values(result, "bar")
        })
    })
})

import { expect } from "chai"
import { describe } from "mocha"
import { expect_seq_n_values } from "../seq_expects"
import {
    application_state_create,
    command_from_input,
    task_create,
    tasks_add,
    tasks_create,
    tasks_format
} from "./tasks"

describe("TaskList Domain", () => {
    it("formats empty Tasks", () => {
        const tasks = tasks_create()
        const formatted_tasks = tasks_format(tasks)

        expect(formatted_tasks).to.eq("Current Tasks:\n")
    })

    it("adds a Task", () => {
        const tasks = tasks_create()

        const result = tasks_add(tasks, task_create("Buy a Milk"))

        const formatted_tasks = tasks_format(result)
        expect(formatted_tasks).to.eq("Current Tasks:\n( ) Buy a Milk\n")
    })

    it("adds two Tasks", () => {
        let tasks = tasks_create()

        tasks = tasks_add(tasks, task_create("Buy a Milk"))
        const result = tasks_add(tasks, task_create("Buy Coffee"))

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
        it("adds a Task", () => {
            const command = command_from_input("create bar")

            const new_state = command(application_state_create())

            expect_seq_n_values(new_state.tasks, task_create("bar"))
        })
    })
})

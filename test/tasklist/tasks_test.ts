import { expect } from "chai"
import { describe } from "mocha"
import { expect_seq_n_values } from "../seq_expects"
import { command_from_input } from "./commands"
import { task_adder, task_create, tasks_create, tasks_format } from "./tasks"
import { application_state_create } from "./use_cases"

describe("Tasks/TaskList Domain", () => {
    it("formats empty Tasks", () => {
        const tasks = tasks_create()
        const formatted_tasks = tasks_format(tasks)

        expect(formatted_tasks).to.eq("Current Tasks:\n")
    })

    it("adds a Task", () => {
        const tasks = tasks_create()

        const result = task_adder("Buy a Milk")(tasks)

        const formatted_tasks = tasks_format(result)
        expect(formatted_tasks).to.eq("Current Tasks:\n( ) Buy a Milk\n")
    })

    it("adds two Tasks", () => {
        let tasks = tasks_create()

        tasks = task_adder("Buy a Milk")(tasks)
        const result = task_adder("Buy Coffee")(tasks)

        const formatted_tasks = tasks_format(result)
        expect(formatted_tasks).to.eq(
            "Current Tasks:\n" +
            "( ) Buy a Milk\n" +
            "( ) Buy Coffee\n"
        )
    })
})

describe("Commands", () => {
    describe("Add Task", () => {
        it("adds a Task", () => {
            const command = command_from_input("create bar")

            const new_state = command(application_state_create())

            expect_seq_n_values(new_state.left, task_create("bar"))
        })
    })
})

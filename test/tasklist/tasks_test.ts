import { expect } from "chai"
import { describe } from "mocha";
import { tasks_add, tasks_create, tasks_format } from "./tasks";

describe("TaskList Domain", () => {
    it("formats empty Tasks", () => {
        const tasks = tasks_create()
        const formatted_tasks = tasks_format(tasks);

        expect(formatted_tasks.value).to.eq("Current Tasks:\n")
    })

    it("adds a Task", () => {
        const tasks = tasks_create()

        const result = tasks_add(tasks, "Buy a Milk");

        const formatted_tasks = tasks_format(result);
        expect(formatted_tasks.value).to.eq("Current Tasks:\n( ) Buy a Milk\n")
    })

    it("adds two Tasks", () => {
        let tasks = tasks_create()

        tasks = tasks_add(tasks, "Buy a Milk")
        const result = tasks_add(tasks, "Buy Coffee")

        const formatted_tasks = tasks_format(result)
        expect(formatted_tasks.value).to.eq(
            "Current Tasks:\n" +
            "( ) Buy a Milk\n" +
            "( ) Buy Coffee\n"
        )
    })
})

// todoStore.js
import {defineStore} from 'pinia';

export const useTodoStore = defineStore('todo', {
    state: () => ({
        tasks: [],
        completed: [],
        displayMode: 'all',
    }),

    getters: {
        // Getter to get the current array based on display mode
        displayedTasks() {
            if (this.displayMode === 'all') {
                return [...this.tasks, ...this.completed];
            } else if (this.displayMode === 'completed') {
                return this.completed;
            }
        },
    },

    actions: {
        addTask(newTask) {
            // Check if the task already exists in the 'tasks' array
            const taskExists = this.tasks.some(task => task.task === newTask.task);

            // If the task doesn't exist, push it to the array
            if (!taskExists) {
                this.tasks.push(newTask);
            } else {
                alert('Task already exists in the array.');
                // You can handle the case where the task already exists, e.g., show an error message.
            }
        },

        deleteTask(index) {
            this.tasks.splice(index, 1);
        },
        completedTask(index) {
            const taskToComplete = this.tasks[index];            // Add a "completed" field and set it to true
            const completedTask = {
                ...taskToComplete,
                completed: true,
            };

            // Push the completed task to the 'completed' array
            this.completed.push(completedTask);
            this.tasks.splice(index, 1);
        },
        deleteCompleted(index) {
            this.completed.splice(index, 1);
        },
        setDisplayMode(mode) {
            this.displayMode = mode;
        },
        // Add a method to set priority if needed
    },
});

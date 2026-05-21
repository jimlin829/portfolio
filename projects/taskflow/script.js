// TaskFlow - Advanced To-Do App
// Features:
// - Add, edit, delete and complete tasks
// - Priority and due date/time
// - Optional task description
// - Search and filters
// - Dark / light theme
// - Visual reminders: overdue, today, tomorrow, due soon
// - Drag and drop manual ordering
// - localStorage persistence

const taskInput = document.getElementById("taskInput");
const descriptionInput = document.getElementById("descriptionInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const filterButtons = document.querySelectorAll(".filter-button");

const searchInput = document.getElementById("searchInput");
const sortInput = document.getElementById("sortInput");
const clearCompletedButton = document.getElementById("clearCompletedButton");
const themeToggleButton = document.getElementById("themeToggleButton");

let tasks = loadTasks();
let currentFilter = "all";
let editingTaskId = null;
let draggedTaskId = null;

// Make old tasks compatible with the new version.
tasks = migrateTasks(tasks);
saveTasks();

loadTheme();
renderTasks();

addTaskButton.addEventListener("click", handleAddOrUpdateTask);

taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        handleAddOrUpdateTask();
    }
});

searchInput.addEventListener("input", renderTasks);
sortInput.addEventListener("change", renderTasks);

clearCompletedButton.addEventListener("click", clearCompletedTasks);
themeToggleButton.addEventListener("click", toggleTheme);

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});

function handleAddOrUpdateTask() {
    const title = taskInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value;
    const dueDate = dateInput.value;

    if (title === "") {
        alert("Please write a task before saving it.");
        return;
    }

    if (editingTaskId !== null) {
        updateTask(editingTaskId, title, description, priority, dueDate);
    } else {
        addTask(title, description, priority, dueDate);
    }

    resetForm();
    saveTasks();
    renderTasks();
}

function addTask(title, description, priority, dueDate) {
    const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        priority: priority,
        dueDate: dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
        order: Date.now()
    };

    tasks.push(newTask);
}

function updateTask(taskId, title, description, priority, dueDate) {
    tasks = tasks.map(function (task) {
        if (task.id === taskId) {
            return {
                ...task,
                title: title,
                description: description,
                priority: priority,
                dueDate: dueDate
            };
        }

        return task;
    });
}

function startEditingTask(taskId) {
    const task = tasks.find(function (task) {
        return task.id === taskId;
    });

    if (!task) {
        return;
    }

    editingTaskId = task.id;
    taskInput.value = task.title;
    descriptionInput.value = task.description || "";
    priorityInput.value = task.priority;
    dateInput.value = task.dueDate;

    addTaskButton.textContent = "Update Task";
    taskInput.focus();
}

function resetForm() {
    editingTaskId = null;
    taskInput.value = "";
    descriptionInput.value = "";
    dateInput.value = "";
    priorityInput.value = "medium";
    addTaskButton.textContent = "Add Task";
}

function toggleTask(taskId) {
    tasks = tasks.map(function (task) {
        if (task.id === taskId) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return task.id !== taskId;
    });

    saveTasks();
    renderTasks();
}

function clearCompletedTasks() {
    const completedCount = tasks.filter(function (task) {
        return task.completed;
    }).length;

    if (completedCount === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const confirmed = confirm(`Delete ${completedCount} completed task(s)?`);

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";

    const visibleTasks = getVisibleTasks();

    if (sortInput.value === "manual") {
        const dragHint = document.createElement("p");
        dragHint.className = "drag-hint";
        dragHint.textContent = "Tip: drag and drop tasks to reorder them.";
        taskList.appendChild(dragHint);
    }

    if (visibleTasks.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No tasks to show.";
        taskList.appendChild(emptyMessage);
    }

    visibleTasks.forEach(function (task) {
        const taskCard = document.createElement("article");
        taskCard.className = "task-card";
        taskCard.draggable = sortInput.value === "manual";
        taskCard.dataset.id = task.id;

        if (task.completed) {
            taskCard.classList.add("completed");
        }

        const reminderStatus = getReminderStatus(task);

        if (!task.completed && reminderStatus === "overdue") {
            taskCard.classList.add("overdue");
        }

        if (!task.completed && reminderStatus === "today") {
            taskCard.classList.add("due-today");
        }

        if (!task.completed && reminderStatus === "soon") {
            taskCard.classList.add("due-soon");
        }

        addDragEvents(taskCard);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", function () {
            toggleTask(task.id);
        });

        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const taskTitle = document.createElement("h3");
        taskTitle.className = "task-title";
        taskTitle.textContent = task.title;

        const taskMeta = document.createElement("div");
        taskMeta.className = "task-meta";

        const priorityTag = document.createElement("span");
        priorityTag.className = `priority ${task.priority}`;
        priorityTag.textContent = formatPriority(task.priority);

        const dateTag = document.createElement("span");
        dateTag.textContent = task.dueDate
            ? `Due: ${formatDateTime(task.dueDate)}`
            : "No due date";

        taskMeta.appendChild(priorityTag);
        taskMeta.appendChild(dateTag);

        const reminderTag = createReminderTag(task);

        if (reminderTag) {
            taskMeta.appendChild(reminderTag);
        }

        taskInfo.appendChild(taskTitle);

        if (task.description) {
            const description = document.createElement("p");
            description.className = "task-description";
            description.textContent = task.description;
            taskInfo.appendChild(description);
        }

        taskInfo.appendChild(taskMeta);

        const taskActions = document.createElement("div");
        taskActions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            startEditingTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);

        taskCard.appendChild(checkbox);
        taskCard.appendChild(taskInfo);
        taskCard.appendChild(taskActions);

        taskList.appendChild(taskCard);
    });

    updateStats();
}

function getVisibleTasks() {
    let visibleTasks = [...tasks];

    visibleTasks = applySearch(visibleTasks);
    visibleTasks = applyFilter(visibleTasks);
    visibleTasks = applySorting(visibleTasks);

    return visibleTasks;
}

function applySearch(taskArray) {
    const searchText = searchInput.value.trim().toLowerCase();

    if (searchText === "") {
        return taskArray;
    }

    return taskArray.filter(function (task) {
        return (
            task.title.toLowerCase().includes(searchText) ||
            (task.description || "").toLowerCase().includes(searchText)
        );
    });
}

function applyFilter(taskArray) {
    if (currentFilter === "pending") {
        return taskArray.filter(function (task) {
            return !task.completed;
        });
    }

    if (currentFilter === "completed") {
        return taskArray.filter(function (task) {
            return task.completed;
        });
    }

    if (currentFilter === "overdue") {
        return taskArray.filter(function (task) {
            return getReminderStatus(task) === "overdue" && !task.completed;
        });
    }

    return taskArray;
}

function applySorting(taskArray) {
    const sortValue = sortInput.value;

    if (sortValue === "manual") {
        return taskArray.sort(function (a, b) {
            return a.order - b.order;
        });
    }

    if (sortValue === "priority") {
        const priorityOrder = {
            high: 1,
            medium: 2,
            low: 3
        };

        return taskArray.sort(function (a, b) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    if (sortValue === "date") {
        return taskArray.sort(function (a, b) {
            if (!a.dueDate && !b.dueDate) {
                return 0;
            }

            if (!a.dueDate) {
                return 1;
            }

            if (!b.dueDate) {
                return -1;
            }

            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }

    return taskArray.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

function createReminderTag(task) {
    if (task.completed) {
        return null;
    }

    const status = getReminderStatus(task);

    if (!status) {
        return null;
    }

    const tag = document.createElement("span");
    tag.className = "reminder-tag";

    if (status === "overdue") {
        tag.classList.add("reminder-overdue");
        tag.textContent = "Overdue";
    }

    if (status === "today") {
        tag.classList.add("reminder-today");
        tag.textContent = "Due today";
    }

    if (status === "tomorrow") {
        tag.classList.add("reminder-tomorrow");
        tag.textContent = "Tomorrow";
    }

    if (status === "soon") {
        tag.classList.add("reminder-soon");
        tag.textContent = "Due soon";
    }

    return tag;
}

function getReminderStatus(task) {
    if (!task.dueDate) {
        return null;
    }

    const now = new Date();
    const dueDate = new Date(task.dueDate);

    if (dueDate < now) {
        return "overdue";
    }

    const diffMs = dueDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (isSameDay(now, dueDate)) {
        return "today";
    }

    if (isTomorrow(now, dueDate)) {
        return "tomorrow";
    }

    if (diffHours <= 48) {
        return "soon";
    }

    return null;
}

function isSameDay(dateA, dateB) {
    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    );
}

function isTomorrow(today, targetDate) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return isSameDay(tomorrow, targetDate);
}

function addDragEvents(taskCard) {
    taskCard.addEventListener("dragstart", function () {
        if (sortInput.value !== "manual") {
            return;
        }

        draggedTaskId = Number(taskCard.dataset.id);
        taskCard.classList.add("dragging");
    });

    taskCard.addEventListener("dragend", function () {
        draggedTaskId = null;
        taskCard.classList.remove("dragging");
    });

    taskCard.addEventListener("dragover", function (event) {
        if (sortInput.value !== "manual") {
            return;
        }

        event.preventDefault();
    });

    taskCard.addEventListener("drop", function (event) {
        event.preventDefault();

        if (sortInput.value !== "manual") {
            return;
        }

        const targetTaskId = Number(taskCard.dataset.id);

        if (draggedTaskId === null || draggedTaskId === targetTaskId) {
            return;
        }

        reorderTasks(draggedTaskId, targetTaskId);
    });
}

function reorderTasks(draggedId, targetId) {
    const draggedIndex = tasks.findIndex(function (task) {
        return task.id === draggedId;
    });

    const targetIndex = tasks.findIndex(function (task) {
        return task.id === targetId;
    });

    if (draggedIndex === -1 || targetIndex === -1) {
        return;
    }

    const [draggedTask] = tasks.splice(draggedIndex, 1);
    tasks.splice(targetIndex, 0, draggedTask);

    tasks.forEach(function (task, index) {
        task.order = index;
    });

    saveTasks();
    renderTasks();
}

function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
}

function toggleTheme() {
    document.body.classList.toggle("light-theme");

    const isLight = document.body.classList.contains("light-theme");

    localStorage.setItem("taskflow_theme", isLight ? "light" : "dark");
    themeToggleButton.textContent = isLight ? "Dark Mode" : "Light Mode";
}

function loadTheme() {
    const savedTheme = localStorage.getItem("taskflow_theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        themeToggleButton.textContent = "Dark Mode";
    } else {
        document.body.classList.remove("light-theme");
        themeToggleButton.textContent = "Light Mode";
    }
}

function saveTasks() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem("taskflow_tasks");

    if (!savedTasks) {
        return [];
    }

    try {
        return JSON.parse(savedTasks);
    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
}

function migrateTasks(taskArray) {
    return taskArray.map(function (task, index) {
        return {
            description: "",
            order: index,
            ...task
        };
    });
}

function formatPriority(priority) {
    if (priority === "low") {
        return "Low";
    }

    if (priority === "medium") {
        return "Medium";
    }

    if (priority === "high") {
        return "High";
    }

    return priority;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
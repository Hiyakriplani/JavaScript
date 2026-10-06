const input = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const list = document.getElementById("taskList");
const addBtn = document.getElementById("addBtn");

addBtn.onclick = addTask;

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

function addTask() {

    if (input.value.trim() === "") {
        alert("Please enter a task!");
        return;
    }

    const li = document.createElement("li");
    li.className = "task";

    const check = document.createElement("input");
    check.type = "checkbox";

    const text = document.createElement("span");
    text.textContent = category.value + " " + input.value;

    const level = document.createElement("b");
    level.textContent = priority.value;

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.className = "edit";

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "delete";

    li.append(check, text, level, edit, del);
    list.appendChild(li);

    check.onchange = function() {
        text.classList.toggle("done", check.checked);
        updateStats();
    };

    edit.onclick = function() {
        const newTask = prompt("Edit task:", text.textContent);

        if (newTask && newTask.trim() !== "") {
            text.textContent = newTask;
        }
    };

    del.onclick = function() {
        li.remove();
        updateStats();
    };

    input.value = "";
    updateStats();
}

function updateStats() {

    const tasks = document.querySelectorAll(".task");

    let completed = 0;
    let highPriority = 0;

    tasks.forEach(function(task) {

        const checkbox = task.querySelector("input[type='checkbox']");
        const priorityText = task.querySelector("b").textContent;

        if (checkbox.checked) {
            completed++;
        }

        if (priorityText.includes("High")) {
            highPriority++;
        }
    });

    const total = tasks.length;
    const pending = total - completed;

    document.getElementById("total").textContent = total;
    document.getElementById("completed").textContent = completed;
    document.getElementById("pending").textContent = pending;
    document.getElementById("high").textContent = highPriority;

    document.getElementById("empty").style.display =
        total === 0 ? "block" : "none";
}
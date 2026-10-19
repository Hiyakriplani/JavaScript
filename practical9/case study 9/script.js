
const $ = (id) => document.getElementById(id);

// Storage keys
const TASKS_KEY = "studySpaceTasks";
const THEME_KEY = "studySpaceTheme";
const NOTES_KEY = "studySpaceNotes";
const SESSION_KEY = "studySpaceSessions";

// Application state
let tasks = [];
let currentFilter = "all";
let selectedMinutes = 25;
let remainingSeconds = selectedMinutes * 60;
let timerInterval = null;
let timerRunning = false;

// Safely load JSON data
function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

// Save data in LocalStorage
function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        alert("Unable to save data. Check your browser storage settings.");
        return false;
    }
}

// Date and greeting
function initializeHeader() {
    const now = new Date();
    const hour = now.getHours();

    let greeting = "Good evening, student! ✨";

    if (hour < 12) {
        greeting = "Good morning, student! ✨";
    } else if (hour < 17) {
        greeting = "Good afternoon, student! ✨";
    }

    $("greeting").textContent = greeting;

    $("todayDate").textContent = now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// THEME: LocalStorage
function loadTheme() {
    let theme = "light";

    try {
        theme = localStorage.getItem(THEME_KEY) || "light";
    } catch (error) {
        theme = "light";
    }

    applyTheme(theme);
}

function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");

    $("themeToggle").textContent =
        theme === "dark" ? "☀️" : "🌙";

    $("themeToggle").setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
}

$("themeToggle").addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark")
        ? "light"
        : "dark";

    try {
        localStorage.setItem(THEME_KEY, nextTheme);
        applyTheme(nextTheme);
    } catch (error) {
        alert("Unable to save your theme preference.");
    }
});

// TASKS: LocalStorage
function loadTasks() {
    const saved = loadData(TASKS_KEY, []);
    tasks = Array.isArray(saved) ? saved.filter(task =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean" &&
        ["High", "Medium", "Low"].includes(task.priority)
    ) : [];

    renderTasks();
}

function saveTasks() {
    return saveData(TASKS_KEY, tasks);
}

$("taskForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const title = $("taskTitle").value.trim();

    if (!title) {
        $("taskTitle").focus();
        return;
    }

    const task = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        title: title,
        subject: $("taskSubject").value,
        priority: $("taskPriority").value,
        completed: false,
        createdAt: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
        })
    };

    tasks.unshift(task);

    if (!saveTasks()) {
        tasks.shift();
        return;
    }

    $("taskTitle").value = "";
    currentFilter = "all";
    updateFilters();
    renderTasks();
    $("taskTitle").focus();
});

function renderTasks() {
    const taskList = $("taskList");
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    $("emptyState").classList.toggle(
        "show",
        filteredTasks.length === 0
    );

    if (filteredTasks.length === 0) {
        $("emptyState").querySelector("h3").textContent =
            tasks.length === 0
                ? "Your study space is clear!"
                : "Nothing to show here!";
        $("emptyState").querySelector("p").textContent =
            tasks.length === 0
                ? "Add a task above and start making progress."
                : "Try another filter to see your tasks.";
    }

    filteredTasks.forEach(task => {
        const item = document.createElement("article");
        item.className = "task-item" + (task.completed ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Complete " + task.title);

        checkbox.addEventListener("change", () => {
            const previousValue = task.completed;
            task.completed = checkbox.checked;

            if (!saveTasks()) {
                task.completed = previousValue;
            }

            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const subject = document.createElement("span");
        subject.className = "subject-tag";
        subject.textContent = task.subject;

        const priority = document.createElement("span");
        priority.className = "priority-tag " + task.priority.toLowerCase();
        priority.textContent = task.priority + " Priority";

        const date = document.createElement("span");
        date.className = "task-date";
        date.textContent = task.createdAt || "";

        meta.append(subject, priority, date);
        content.append(title, meta);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Delete " + task.title);

        deleteButton.addEventListener("click", () => {
            if (!confirm("Delete this study task?")) return;

            const oldTasks = tasks;
            tasks = tasks.filter(item => item.id !== task.id);

            if (!saveTasks()) {
                tasks = oldTasks;
            }

            renderTasks();
        });

        item.append(checkbox, content, deleteButton);
        taskList.appendChild(item);
    });

    updateStatistics();
}

function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    $("totalTasks").textContent = total;
    $("pendingTasks").textContent = pending;
    $("completedTasks").textContent = completed;
    $("progressText").textContent = progress + "%";
    $("progressBar").style.width = progress + "%";
    $("taskCountLabel").textContent =
        total + (total === 1 ? " task" : " tasks");
}

// Task filters
function updateFilters() {
    document.querySelectorAll(".filter-btn").forEach(button => {
        const isActive = button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        updateFilters();
        renderTasks();
    });
});

// NOTES: LocalStorage
function loadNotes() {
    try {
        $("quickNotes").value = localStorage.getItem(NOTES_KEY) || "";
    } catch (error) {
        $("notesStatus").textContent = "Notes could not be loaded";
    }
}

$("quickNotes").addEventListener("input", () => {
    try {
        localStorage.setItem(NOTES_KEY, $("quickNotes").value);
        $("notesStatus").textContent = "Saved automatically ✓";
    } catch (error) {
        $("notesStatus").textContent = "Unable to save notes";
    }
});

$("clearNotes").addEventListener("click", () => {
    if (!$("quickNotes").value) return;
    if (!confirm("Clear all your quick notes?")) return;

    $("quickNotes").value = "";

    try {
        localStorage.removeItem(NOTES_KEY);
        $("notesStatus").textContent = "Notes cleared";
    } catch (error) {
        $("notesStatus").textContent = "Unable to clear notes";
    }
});

// SESSIONSTORAGE: focus session counter
function loadSessionCount() {
    try {
        const count = Number(sessionStorage.getItem(SESSION_KEY)) || 0;
        $("sessionCount").textContent = count;
    } catch (error) {
        $("sessionCount").textContent = "0";
    }
}

function incrementSessionCount() {
    try {
        const count =
            (Number(sessionStorage.getItem(SESSION_KEY)) || 0) + 1;

        sessionStorage.setItem(SESSION_KEY, String(count));
        $("sessionCount").textContent = count;
    } catch (error) {
        $("sessionCount").textContent = "—";
    }
}

// FOCUS TIMER
function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    $("timerDisplay").textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    const totalSeconds = selectedMinutes * 60;
    const percentage = totalSeconds > 0
        ? (remainingSeconds / totalSeconds) * 100
        : 0;

    const elapsed = 100 - percentage;

    document.querySelector(".timer-circle").style.background =
        `conic-gradient(var(--accent) ${elapsed}%, var(--accent-soft) ${elapsed}%)`;

    document.title = timerRunning
        ? $("timerDisplay").textContent + " | StudySpace"
        : "StudySpace | Student Study Planner";
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
    $("timerStart").textContent = "▶ Start Focus";
}

function startTimer() {
    if (timerRunning) {
        stopTimer();
        updateTimerDisplay();
        return;
    }

    if (remainingSeconds <= 0) {
        remainingSeconds = selectedMinutes * 60;
    }

    timerRunning = true;
    $("timerStart").textContent = "Ⅱ Pause Focus";

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();

        if (remainingSeconds <= 0) {
            stopTimer();
            remainingSeconds = 0;
            updateTimerDisplay();
            incrementSessionCount();
            alert("Focus session complete! Great work. Take a short break.");
        }
    }, 1000);
}

$("timerStart").addEventListener("click", startTimer);

$("timerReset").addEventListener("click", () => {
    stopTimer();
    remainingSeconds = selectedMinutes * 60;
    updateTimerDisplay();
});

document.querySelectorAll(".timer-option").forEach(button => {
    button.addEventListener("click", () => {
        stopTimer();

        selectedMinutes = Number(button.dataset.minutes);
        remainingSeconds = selectedMinutes * 60;

        document.querySelectorAll(".timer-option").forEach(option => {
            option.classList.toggle("active", option === button);
        });

        updateTimerDisplay();
    });
});

// Initialize the complete application
initializeHeader();
loadTheme();
loadTasks();
loadNotes();
loadSessionCount();
updateTimerDisplay();

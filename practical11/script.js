
const form = document.getElementById("classForm");
const subjectInput = document.getElementById("className");
const roomInput = document.getElementById("classRoom");
const timeInput = document.getElementById("classTime");

const scheduleList = document.getElementById("scheduleList");
const classCount = document.getElementById("classCount");
const message = document.getElementById("message");

let classes = [];
let remindedClasses = new Set();

function formatTime(time) {
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderClasses() {
    scheduleList.innerHTML = "";
    classCount.textContent = classes.length;

    if (classes.length === 0) {
        scheduleList.innerHTML = "<p>No classes added yet.</p>";
        return;
    }

    const sortedClasses = [...classes].sort((a, b) =>
        a.time.localeCompare(b.time)
    );

    sortedClasses.forEach((item) => {
        const card = document.createElement("div");
        card.className = "class-card";

        const heading = document.createElement("h3");
        heading.textContent = item.name;

        const room = document.createElement("p");
        room.textContent = "Room: " + item.room;

        const time = document.createElement("p");
        time.textContent = "Time: " + formatTime(item.time);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            classes = classes.filter(c => c.id !== item.id);
            remindedClasses.delete(item.id);
            renderClasses();
            updateCountdown();
            message.textContent = "Class removed.";
        });

        card.appendChild(heading);
        card.appendChild(room);
        card.appendChild(time);
        card.appendChild(removeButton);

        scheduleList.appendChild(card);
    });
}

function updateClock() {
    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString();

    document.getElementById("todayDate").textContent =
        now.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}

function updateCountdown() {
    const now = new Date();

    const upcoming = classes
        .map(item => {
            const [hour, minute] = item.time.split(":").map(Number);
            const start = new Date();

            start.setHours(hour, minute, 0, 0);

            return { ...item, start };
        })
        .filter(item => item.start > now)
        .sort((a, b) => a.start - b.start);

    if (upcoming.length === 0) {
        document.getElementById("nextSubject").textContent =
            "No upcoming classes";

        document.getElementById("nextClass").textContent =
            "Add a class scheduled for later today";

        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        document.getElementById("reminderStatus").textContent =
            "No upcoming class right now.";
        return;
    }

    const next = upcoming[0];
    const difference = next.start.getTime() - now.getTime();

    document.getElementById("nextSubject").textContent = next.name;
    document.getElementById("nextClass").textContent =
        "Starts at " + formatTime(next.time);

    document.getElementById("hours").textContent =
        String(Math.floor(difference / 3600000)).padStart(2, "0");

    document.getElementById("minutes").textContent =
        String(Math.floor((difference % 3600000) / 60000)).padStart(2, "0");

    document.getElementById("seconds").textContent =
        String(Math.floor((difference % 60000) / 1000)).padStart(2, "0");

    const reminderStatus = document.getElementById("reminderStatus");
    const reminderDelay = difference - 60000;

    if (reminderDelay > 0 && !remindedClasses.has(next.id)) {
        reminderStatus.textContent = "Reminder set for 1 minute before class.";
    } else if (difference <= 60000 && !remindedClasses.has(next.id)) {
        remindedClasses.add(next.id);
        reminderStatus.textContent = "Your class is starting soon!";
        alert("Reminder: " + next.name + " starts now or within one minute!");
    } else {
        reminderStatus.textContent = "Countdown is running.";
    }

    if (reminderDelay > 0 && !remindedClasses.has(next.id)) {
        if (!next.reminderScheduled) {
            next.reminderScheduled = true;

            setTimeout(() => {
                if (classes.some(c => c.id === next.id) &&
                    !remindedClasses.has(next.id)) {
                    remindedClasses.add(next.id);
                    alert("Reminder: " + next.name + " starts in 1 minute!");
                    reminderStatus.textContent = "Reminder sent for " + next.name + ".";
                }
            }, reminderDelay);
        }
    }
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = subjectInput.value.trim();
    const room = roomInput.value.trim();
    const time = timeInput.value;

    if (!name || !room || !time) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    classes.push({
        id: Date.now(),
        name: name,
        room: room,
        time: time
    });

    renderClasses();
    updateCountdown();

    form.reset();
    message.textContent = "✅ Class added successfully!";
});

updateClock();
renderClasses();
updateCountdown();

setInterval(() => {
    updateClock();
    updateCountdown();
}, 1000);

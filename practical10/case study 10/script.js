
const apiURL = "https://jsonplaceholder.typicode.com/users";

const fetchBtn = document.getElementById("fetchBtn");
const jqueryBtn = document.getElementById("jqueryBtn");
const studentTable = document.getElementById("studentTable");
const statusText = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const sortBy = document.getElementById("sortBy");
const totalStudents = document.getElementById("totalStudents");
const recordCount = document.getElementById("recordCount");

let students = [];

// Convert API user records into sample student records
function convertToStudents(data) {
    const departments = [
        "Computer Engineering",
        "Information Technology",
        "Electronics",
        "Mechanical",
        "Civil"
    ];

    return data.map((user, index) => ({
        roll: 101 + index,
        name: user.name,
        email: user.email,
        department: departments[index % departments.length],
        year: index % 4 + 1,
        marks: 65 + ((index * 7) % 35)
    }));
}

// Populate the department filter
function populateDepartments() {
    const currentDepartment = departmentFilter.value;
    const departments = [...new Set(
        students.map(student => student.department)
    )];

    departmentFilter.innerHTML =
        '<option value="all">All Departments</option>';

    departments.forEach(department => {
        const option = document.createElement("option");
        option.value = department;
        option.textContent = department;
        departmentFilter.appendChild(option);
    });

    if (departments.includes(currentDepartment)) {
        departmentFilter.value = currentDepartment;
    }
}

// Display records in the HTML table
function displayStudents(data) {
    studentTable.innerHTML = "";

    totalStudents.textContent = data.length;
    recordCount.textContent =
        `${data.length} ${data.length === 1 ? "record" : "records"}`;

    if (data.length === 0) {
        studentTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    No matching student records found.
                </td>
            </tr>`;
        return;
    }

    data.forEach(student => {
        const row = document.createElement("tr");

        const values = [
            student.roll,
            student.name,
            student.email,
            student.department,
            `Year ${student.year}`,
            `${student.marks}%`
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value;

            if (index === 5) {
                cell.classList.add("marks");
            }

            row.appendChild(cell);
        });

        studentTable.appendChild(row);
    });
}

// Apply search, department filter and sorting
function updateTable() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedDepartment = departmentFilter.value;
    const selectedSort = sortBy.value;

    let filtered = students.filter(student => {
        const matchesSearch =
            String(student.roll).includes(query) ||
            student.name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query);

        const matchesDepartment =
            selectedDepartment === "all" ||
            student.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    if (selectedSort === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSort === "roll") {
        filtered.sort((a, b) => a.roll - b.roll);
    } else if (selectedSort === "marks") {
        filtered.sort((a, b) => b.marks - a.marks);
    }

    displayStudents(filtered);
}

// Shared function for successful data loading
function handleSuccess(data, method) {
    students = convertToStudents(data);
    populateDepartments();
    updateTable();

    statusText.classList.remove("error");
    statusText.textContent =
        `Student records loaded successfully using ${method}.`;
}

// Display errors
function handleError() {
    students = [];
    studentTable.innerHTML = `
        <tr>
            <td colspan="6" class="empty">
                Unable to load data. Please try again.
            </td>
        </tr>`;

    totalStudents.textContent = "0";
    recordCount.textContent = "0 records";
    statusText.classList.add("error");
    statusText.textContent =
        "Error loading JSON data. Check your internet connection.";
}

// 1. Load JSON using the Fetch API
fetchBtn.addEventListener("click", async function () {
    fetchBtn.disabled = true;
    jqueryBtn.disabled = true;
    statusText.classList.remove("error");
    statusText.textContent = "Loading data using fetch()...";

    try {
        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("HTTP request failed");
        }

        const data = await response.json();
        handleSuccess(data, "fetch()");
    } catch (error) {
        handleError();
    } finally {
        fetchBtn.disabled = false;
        jqueryBtn.disabled = false;
    }
});

// 2. Load JSON using jQuery $.getJSON()
jqueryBtn.addEventListener("click", function () {
    fetchBtn.disabled = true;
    jqueryBtn.disabled = true;
    statusText.classList.remove("error");
    statusText.textContent = "Loading data using $.getJSON()...";

    $.getJSON(apiURL)
        .done(function (data) {
            handleSuccess(data, "$.getJSON()");
        })
        .fail(function () {
            handleError();
        })
        .always(function () {
            fetchBtn.disabled = false;
            jqueryBtn.disabled = false;
        });
});

// Search records dynamically
searchInput.addEventListener("input", updateTable);

// Filter by department
departmentFilter.addEventListener("change", updateTable);

// Sort records
sortBy.addEventListener("change", updateTable);

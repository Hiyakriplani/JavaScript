// Accessing form fields using DOM
const form = document.getElementById("gymForm");

const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const phoneField = document.getElementById("phone");
const ageField = document.getElementById("age");
const planField = document.getElementById("plan");
const termsField = document.getElementById("terms");


// -----------------------------
// Name Validation
// -----------------------------

function validateName() {

    let name = nameField.value.trim();
    let error = document.getElementById("nameError");

    if (name === "") {
        error.textContent = "Name is required.";
        nameField.classList.add("invalid");
        nameField.classList.remove("valid");
        return false;
    }

    if (name.length < 3) {
        error.textContent = "Name must contain at least 3 characters.";
        nameField.classList.add("invalid");
        nameField.classList.remove("valid");
        return false;
    }

    error.textContent = "✓ Looks good!";
    error.style.color = "#4d8b20";

    nameField.classList.add("valid");
    nameField.classList.remove("invalid");

    return true;
}


// -----------------------------
// Email Validation
// -----------------------------

function validateEmail() {

    let email = emailField.value.trim();
    let error = document.getElementById("emailError");

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
        error.textContent = "Email is required.";
        error.style.color = "#e05252";

        emailField.classList.add("invalid");
        emailField.classList.remove("valid");

        return false;
    }

    if (!emailPattern.test(email)) {
        error.textContent = "Enter a valid email address.";
        error.style.color = "#e05252";

        emailField.classList.add("invalid");
        emailField.classList.remove("valid");

        return false;
    }

    error.textContent = "✓ Valid email";
    error.style.color = "#4d8b20";

    emailField.classList.add("valid");
    emailField.classList.remove("invalid");

    return true;
}


// -----------------------------
// Phone Validation
// -----------------------------

function validatePhone() {

    let phone = phoneField.value.trim();
    let error = document.getElementById("phoneError");

    let phonePattern = /^[0-9]{10}$/;

    if (phone === "") {
        error.textContent = "Phone number is required.";
        error.style.color = "#e05252";

        phoneField.classList.add("invalid");
        phoneField.classList.remove("valid");

        return false;
    }

    if (!phonePattern.test(phone)) {
        error.textContent = "Enter exactly 10 digits.";
        error.style.color = "#e05252";

        phoneField.classList.add("invalid");
        phoneField.classList.remove("valid");

        return false;
    }

    error.textContent = "✓ Valid phone number";
    error.style.color = "#4d8b20";

    phoneField.classList.add("valid");
    phoneField.classList.remove("invalid");

    return true;
}


// -----------------------------
// Age Validation
// -----------------------------

function validateAge() {

    let age = Number(ageField.value);
    let error = document.getElementById("ageError");

    if (ageField.value === "") {
        error.textContent = "Age is required.";
        error.style.color = "#e05252";

        ageField.classList.add("invalid");
        ageField.classList.remove("valid");

        return false;
    }

    if (age < 16 || age > 70) {
        error.textContent = "Age must be between 16 and 70.";
        error.style.color = "#e05252";

        ageField.classList.add("invalid");
        ageField.classList.remove("valid");

        return false;
    }

    error.textContent = "✓ Age accepted";
    error.style.color = "#4d8b20";

    ageField.classList.add("valid");
    ageField.classList.remove("invalid");

    return true;
}


// -----------------------------
// Membership Validation
// -----------------------------

function validatePlan() {

    let error = document.getElementById("planError");

    if (planField.value === "") {

        error.textContent = "Please select a membership plan.";
        error.style.color = "#e05252";

        planField.classList.add("invalid");
        planField.classList.remove("valid");

        return false;
    }

    error.textContent = "✓ Plan selected";
    error.style.color = "#4d8b20";

    planField.classList.add("valid");
    planField.classList.remove("invalid");

    return true;
}


// -----------------------------
// Gender Validation
// -----------------------------

function validateGender() {

    let gender = document.querySelector(
        'input[name="gender"]:checked'
    );

    let error = document.getElementById("genderError");

    if (!gender) {
        error.textContent = "Please select your gender.";
        error.style.color = "#e05252";
        return false;
    }

    error.textContent = "✓ Selected";
    error.style.color = "#4d8b20";

    return true;
}


// -----------------------------
// Terms Validation
// -----------------------------

function validateTerms() {

    let error = document.getElementById("termsError");

    if (!termsField.checked) {

        error.textContent =
            "You must agree to the terms and conditions.";

        error.style.color = "#e05252";

        return false;
    }

    error.textContent = "✓ Terms accepted";
    error.style.color = "#4d8b20";

    return true;
}


// ======================================
// LIVE INPUT EVENTS
// ======================================

nameField.addEventListener("input", validateName);

emailField.addEventListener("input", validateEmail);

phoneField.addEventListener("input", validatePhone);

ageField.addEventListener("input", validateAge);


// ======================================
// BLUR EVENTS
// ======================================

nameField.addEventListener("blur", validateName);

emailField.addEventListener("blur", validateEmail);

phoneField.addEventListener("blur", validatePhone);

ageField.addEventListener("blur", validateAge);


// ======================================
// CHANGE EVENTS
// ======================================

planField.addEventListener("change", validatePlan);

termsField.addEventListener("change", validateTerms);


// Gender change event
document.querySelectorAll(
    'input[name="gender"]'
).forEach(function(radio) {

    radio.addEventListener("change", validateGender);

});


// ======================================
// FORM SUBMIT EVENT
// ======================================

form.addEventListener("submit", function(event) {

    // Prevent actual form submission
    event.preventDefault();

    // Validate all fields
    let nameValid = validateName();
    let emailValid = validateEmail();
    let phoneValid = validatePhone();
    let ageValid = validateAge();
    let genderValid = validateGender();
    let planValid = validatePlan();
    let termsValid = validateTerms();

    // Check whether everything is valid
    if (
        nameValid &&
        emailValid &&
        phoneValid &&
        ageValid &&
        genderValid &&
        planValid &&
        termsValid
    ) {

        document.getElementById("successMessage").textContent =
            "🎉 Admission successful! Welcome to FitZone!";

        form.reset();

        // Remove validation styles after reset
        document.querySelectorAll("input, select").forEach(function(field) {
            field.classList.remove("valid");
            field.classList.remove("invalid");
        });

    } else {

        document.getElementById("successMessage").textContent =
            "Please correct the errors above.";

    }

});
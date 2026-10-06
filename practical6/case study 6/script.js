// Email Validation using Regular Expression
function validateEmail() {

    let email = document.getElementById("email").value;

    // Regex for email validation
    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailPattern.test(email)) {
        document.getElementById("emailResult").innerHTML =
            "Valid Email Address";
    } else {
        document.getElementById("emailResult").innerHTML =
            "Invalid Email Address";
    }
}


// Text Analysis
function analyzeText() {

    let text = document.getElementById("text").value;

    // String functions
    let characters = text.length;

    let words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    let lines = text === "" ? 0 : text.split("\n").length;

    let uppercaseText = text.toUpperCase();

    let lowercaseText = text.toLowerCase();

    // Regex for extracting email addresses
    let emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let emails = text.match(emailPattern);

    // Regex for extracting phone numbers
    let phonePattern = /\b\d{10}\b/g;
    let phones = text.match(phonePattern);

    // Regex for finding numbers
    let numberPattern = /\b\d+\b/g;
    let numbers = text.match(numberPattern);

    // Display results
    document.getElementById("textResult").innerHTML =
        "Number of Characters: " + characters + "<br>" +
        "Number of Words: " + words + "<br>" +
        "Number of Lines: " + lines + "<br><br>" +

        "<b>Uppercase Text:</b><br>" +
        uppercaseText + "<br><br>" +

        "<b>Lowercase Text:</b><br>" +
        lowercaseText + "<br><br>" +

        "<b>Emails Found:</b><br>" +
        (emails ? emails.join(", ") : "None") + "<br><br>" +

        "<b>Phone Numbers Found:</b><br>" +
        (phones ? phones.join(", ") : "None") + "<br><br>" +

        "<b>Numbers Found:</b><br>" +
        (numbers ? numbers.join(", ") : "None");
}
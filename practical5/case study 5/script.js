function analyzeArray() {

    // Get array input from the user
    let input = document.getElementById("arrayInput").value;

    // Convert input into an array
    let numbers = input.split(",").map(Number);

    // Check if input is empty or invalid
    if (input.trim() === "" || numbers.some(isNaN)) {
        alert("Please enter valid numbers separated by commas.");
        return;
    }

    // Assume first element as maximum and minimum
    let maximum = numbers[0];
    let minimum = numbers[0];

    // Analyze the array
    for (let i = 1; i < numbers.length; i++) {

        if (numbers[i] > maximum) {
            maximum = numbers[i];
        }

        if (numbers[i] < minimum) {
            minimum = numbers[i];
        }
    }

    // Display the results
    document.getElementById("maximum").innerHTML = maximum;
    document.getElementById("minimum").innerHTML = minimum;
}
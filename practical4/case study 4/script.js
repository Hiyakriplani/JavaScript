// ======================================
// FUNCTION TO REVERSE A NUMBER
// ======================================

function reverseNumber(num) {

    let reverse = 0;

    while (num > 0) {

        let digit = num % 10;

        reverse = reverse * 10 + digit;

        num = Math.floor(num / 10);
    }

    return reverse;
}



// ======================================
// FUNCTION TO CHECK PALINDROME
// ======================================

function checkPalindrome() {

    try {

        // Get input value
        let input = document.getElementById("number").value;

        let result = document.getElementById("result");


        // Check if input is empty
        if (input === "") {

            throw new Error("Please enter a number.");
        }


        // Convert input into number
        let num = Number(input);


        // Check whether input is a valid number
        if (isNaN(num)) {

            throw new Error("Invalid number entered.");
        }


        // Check for negative numbers
        if (num < 0) {

            throw new Error("Please enter a positive number.");
        }


        // Call reverseNumber function
        let reversed = reverseNumber(num);


        // Compare original and reversed number
        if (num === reversed) {

            result.innerHTML = `

                <div class="result-icon">
                    ✓
                </div>

                <div>

                    <h3>
                        ${num} is a Palindrome!
                    </h3>

                    <p>
                        Reverse:
                        <strong>${reversed}</strong>
                    </p>

                </div>

            `;

            result.style.background = "#edf5ef";

            result.style.borderColor = "#d5e8da";

        }

        else {

            result.innerHTML = `

                <div class="result-icon">
                    ×
                </div>

                <div>

                    <h3>
                        ${num} is not a Palindrome
                    </h3>

                    <p>
                        Reverse:
                        <strong>${reversed}</strong>
                    </p>

                </div>

            `;

            result.style.background = "#faf0f1";

            result.style.borderColor = "#efd9dd";
        }

    }


    // ======================================
    // CATCH BLOCK
    // ======================================

    catch (error) {

        let result = document.getElementById("result");

        result.innerHTML = `

            <div class="result-icon">
                !
            </div>

            <div>

                <h3>
                    Error
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

        result.style.background = "#fff4e8";

        result.style.borderColor = "#f1dfc8";
    }
}
function compareTime() {

    try {

        let study = Number(document.getElementById("study").value);
        let instagram = Number(document.getElementById("instagram").value);
        let limit = Number(document.getElementById("limit").value);

        if (study < 0 || instagram < 0 || limit <= 0) {
            throw new Error("Please enter valid values.");
        }

        if (
            document.getElementById("study").value === "" ||
            document.getElementById("instagram").value === ""
        ) {
            throw new Error("Please enter both times.");
        }

        let score = Math.round(
            (study / (study + instagram)) * 100
        );

        let difference = Math.abs(study - instagram);

        let message;

        if (study > instagram) {
            message = `📚 Study wins by ${difference} minutes!`;
        }
        else if (instagram > study) {
            message = `📱 Instagram wins by ${difference} minutes!`;
        }
        else {
            message = `⚖ Both took the same time!`;
        }

        let limitMessage;

        if (instagram > limit) {
            limitMessage =
                `⚠ You exceeded your Instagram limit by ${instagram - limit} minutes.`;
        }
        else {
            limitMessage =
                `✓ You are within your Instagram limit.`;
        }

        document.getElementById("result").innerHTML = `
            <b>${message}</b>
            <p>Productivity Score: ${score}%</p>
            <p>${limitMessage}</p>
        `;

    }

    catch (error) {

        document.getElementById("result").innerHTML = `
            <b>⚠ Error</b>
            <p>${error.message}</p>
        `;
    }
}


function openInstagram() {
    window.location.href = "https://www.instagram.com/";
}
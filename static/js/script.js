
const scanButton = document.getElementById("scanButton");
const inputText = document.getElementById("inputText");
const result = document.getElementById("result");

scanButton.addEventListener("click", async function () {

    const text = inputText.value.trim();

    if (text === "") {
        alert("Please enter some text to scan.");
        return;
    }

    scanButton.disabled = true;
    scanButton.textContent = "Scanning...";

    result.replaceChildren();

    try {

        const response = await fetch("/scan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error("Scanning failed");
        }

        const data = await response.json();

        // Main heading
        const heading = document.createElement("h2");
        heading.className = "result-title";
        heading.textContent = "Scan Results";
        result.appendChild(heading);

        // Summary section
        const summary = document.createElement("div");
        summary.className = "summary-card";

        const summaryText = document.createElement("p");
        summaryText.textContent = "Sensitive Information Found";

        const total = document.createElement("h2");
        total.textContent = data.total;

        summary.appendChild(summaryText);
        summary.appendChild(total);
        result.appendChild(summary);

        // If sensitive information is found
        if (data.total > 0) {

            const detectionHeading = document.createElement("h3");
            detectionHeading.className = "section-title";
            detectionHeading.textContent = "Detected Information";
            result.appendChild(detectionHeading);

            const detectionGrid = document.createElement("div");
            detectionGrid.className = "detection-grid";

            data.detections.forEach(function (item) {

                const card = document.createElement("div");
                card.className = "detection-card";

                const category = document.createElement("span");
                category.className = "category-label";
                category.textContent = item.category;

                const value = document.createElement("p");
                value.className = "detected-value";
                value.textContent = item.value;

                card.appendChild(category);
                card.appendChild(value);

                detectionGrid.appendChild(card);
            });

            result.appendChild(detectionGrid);

            // Protected text section
            const protectedHeading = document.createElement("h3");
            protectedHeading.className = "section-title";
            protectedHeading.textContent = "Protected Text";
            result.appendChild(protectedHeading);

            const protectedBox = document.createElement("div");
            protectedBox.className = "redacted-box";

            const message = document.createElement("p");
            message.textContent =
                "Your sensitive information has been replaced below.";

            const protectedText = document.createElement("p");
            protectedText.className = "redacted-text";
            protectedText.textContent = data.redacted_text;

            protectedBox.appendChild(message);
            protectedBox.appendChild(protectedText);

            result.appendChild(protectedBox);

        } else {

            // No sensitive information found
            const noResults = document.createElement("div");
            noResults.className = "no-results";

            noResults.textContent =
                "No sensitive information detected. Your text appears to be free of the information PrivShield currently detects.";

            result.appendChild(noResults);

            // Protected Text section is not displayed
        }

    } catch (error) {

        const errorMessage = document.createElement("p");
        errorMessage.textContent =
            "Something went wrong. Please try again.";

        result.appendChild(errorMessage);

    } finally {

        scanButton.disabled = false;
        scanButton.textContent = "Scan Text";
    }

});

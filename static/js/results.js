
const summary = document.getElementById("summary");
const detectionList = document.getElementById("detectionList");
const protectedText = document.getElementById("protectedText");
const copyButton = document.getElementById("copyButton");


// Retrieve and immediately clear temporary results
const savedResults = sessionStorage.getItem("privshieldResults");
sessionStorage.removeItem("privshieldResults");

if (!savedResults) {
    window.location.replace("/");
} else {
    const data = JSON.parse(savedResults);

    // Display summary
    const heading = document.createElement("h3");
    heading.textContent = data.total > 0
        ? "Sensitive Information Found"
        : "No Sensitive Information Found";

    const total = document.createElement("p");
    total.textContent = "Total detections: " + data.total;

    summary.appendChild(heading);
    summary.appendChild(total);

    // Display detections
    if (data.total > 0) {

        data.detections.forEach(function (item) {

            const card = document.createElement("div");
            card.className = "detection-card";

            const category = document.createElement("h4");
            category.textContent = item.category;

            const value = document.createElement("p");
            value.textContent = item.value;

            card.appendChild(category);
            card.appendChild(value);

            detectionList.appendChild(card);
        });

    } else {
        detectionList.textContent =
            "No sensitive information detected by the current detection rules.";
    }

// Display protected text only when detections exist
const protectedSection = document.getElementById("protectedSection");

if (data.total > 0) {
    protectedSection.hidden = false;
    protectedText.textContent = data.redacted_text;
} else {
    protectedSection.hidden = true;
}

    // Copy protected text
    copyButton.addEventListener("click", async function () {

        try {
            await navigator.clipboard.writeText(data.redacted_text);
            copyButton.textContent = "Copied!";

            setTimeout(function () {
                copyButton.textContent = "Copy Protected Text";
            }, 2000);

        } catch (error) {
            copyButton.textContent = "Copy failed";
        }
    });
}

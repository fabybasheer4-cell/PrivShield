
const scanButton = document.getElementById("scanButton");
const scanFileButton = document.getElementById("scanFileButton");

const inputText = document.getElementById("inputText");
const fileInput = document.getElementById("fileInput");

const result = document.getElementById("result");


// Display scanning results
function displayResults(data) {

    result.replaceChildren();

    // Main heading
    const heading = document.createElement("h2");
    heading.className = "result-title";
    heading.textContent = "Scan Results";

    result.appendChild(heading);

    // Summary card
    const summary = document.createElement("div");
    summary.className = "summary-card";

    const summaryText = document.createElement("p");

    summaryText.textContent =
        data.total > 0
            ? "Sensitive Information Found"
            : "No Sensitive Information Found";

    const total = document.createElement("h2");
    total.textContent = data.total;

    summary.appendChild(summaryText);
    summary.appendChild(total);

    result.appendChild(summary);


    if (data.total > 0) {

        // Detected information heading
        const detectionHeading = document.createElement("h3");
        detectionHeading.className = "section-title";
        detectionHeading.textContent = "Detected Information";

        result.appendChild(detectionHeading);

        // Detection list
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


        // Protected text
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

        // Copy button
const copyButton = document.createElement("button");
copyButton.textContent = "Copy Protected Text";
copyButton.className = "copy-button";

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

protectedBox.appendChild(message);
protectedBox.appendChild(protectedText);
protectedBox.appendChild(copyButton);

result.appendChild(protectedBox);

    } else {

        // No sensitive information message
        const noResults = document.createElement("div");
        noResults.className = "no-results";

        noResults.textContent =
            "No sensitive information detected. Your text appears to be free of the information PrivShield currently detects.";

        result.appendChild(noResults);
    }
}


// Display errors
function displayError(message) {

    result.replaceChildren();

    const errorMessage = document.createElement("p");
    errorMessage.textContent = message;

    result.appendChild(errorMessage);
}


// Enable and disable buttons
function setLoading(isLoading, activeButton) {

    scanButton.disabled = isLoading;
    scanFileButton.disabled = isLoading;

    if (isLoading) {

        activeButton.textContent = "Scanning...";

    } else {

        scanButton.textContent = "Scan Text";
        scanFileButton.textContent = "Scan File";
    }
}


// Scan pasted text
scanButton.addEventListener("click", async function () {

    const text = inputText.value;

    if (text.trim() === "") {
        alert("Please enter some text to scan.");
        return;
    }

    setLoading(true, scanButton);
    result.replaceChildren();

    try {

        const response = await fetch("/scan", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                text: text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Scanning failed");
        }

        displayResults(data);

    } catch (error) {

        displayError(error.message || "Something went wrong. Please try again.");

    } finally {

        setLoading(false);
    }

});


// Upload and scan TXT file
scanFileButton.addEventListener("click", async function () {

    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a TXT file first.");
        return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
        alert("Only TXT files are allowed.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true, scanFileButton);
    result.replaceChildren();

    try {

        const response = await fetch("/scan-file", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "File scanning failed");
        }

        displayResults(data);

    } catch (error) {

        displayError(error.message || "Something went wrong. Please try again.");

    } finally {

        setLoading(false);
    }

});
// Display selected file name
fileInput.addEventListener("change", function () {

    const fileName = document.getElementById("fileName");

    if (fileInput.files.length > 0) {
        fileName.textContent = fileInput.files[0].name;
    } else {
        fileName.textContent = "No file selected";
    }

});

// Switch between scanning tabs
function showTab(tab) {

    const textTab = document.getElementById("textTab");
    const fileTab = document.getElementById("fileTab");

    const textPanel = document.getElementById("textPanel");
    const filePanel = document.getElementById("filePanel");

    if (tab === "text") {

        textTab.classList.add("active");
        fileTab.classList.remove("active");

        textPanel.classList.add("active");
        filePanel.classList.remove("active");

    } else {

        fileTab.classList.add("active");
        textTab.classList.remove("active");

        filePanel.classList.add("active");
        textPanel.classList.remove("active");
    }
}


// Display selected file name
fileInput.addEventListener("change", function () {

    const fileName = document.getElementById("fileName");

    if (fileInput.files.length > 0) {
        fileName.textContent = fileInput.files[0].name;
    } else {
        fileName.textContent = "No file selected";
    }

});

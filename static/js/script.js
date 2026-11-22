
const scanButton = document.getElementById("scanButton");
const scanFileButton = document.getElementById("scanFileButton");

const inputText = document.getElementById("inputText");
const fileInput = document.getElementById("fileInput");

const result = document.getElementById("result");


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


// Open results page with scan data
function openResultsPage(data) {
    sessionStorage.setItem("privshieldResults", JSON.stringify(data));
    window.location.href = "/results";
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
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Scanning failed");
        }

        openResultsPage(data);

    } catch (error) {
        displayError(error.message || "Something went wrong. Please try again.");
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

        openResultsPage(data);

    } catch (error) {
        displayError(error.message || "Something went wrong. Please try again.");
        setLoading(false);
    }
});


// Display selected file name
fileInput.addEventListener("change", function () {

    const fileName = document.getElementById("fileName");

    fileName.textContent = fileInput.files.length > 0
        ? fileInput.files[0].name
        : "No file selected";
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

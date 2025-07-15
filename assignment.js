console.log("Assignment.js: Script started loading (No Firebase).");

// Get references to HTML elements
const uploadedFilesList = document.getElementById('uploaded-files-list');
const loadingMessage = document.getElementById('loading-message');
const noFilesMessage = document.getElementById('no-files-message');
const summarySection = document.getElementById('summary-section');
const summaryText = document.getElementById('summary-text');
const summaryLoading = document.getElementById('summary-loading');
const summaryError = document.getElementById('summary-error');


// Function to display messages (specific to assignment page)
function showMessage(message, isError = false) {
    let msgBox = document.getElementById('assignment-message-box');
    if (!msgBox) {
        msgBox = document.createElement('div');
        msgBox.id = 'assignment-message-box';
        msgBox.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            padding: 15px 25px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000; font-size: 16px; font-weight: 500; text-align: center;
            display: none;
        `;
        document.body.appendChild(msgBox);
    }

    msgBox.textContent = message;
    msgBox.style.display = 'block';
    msgBox.style.color = isError ? 'green' : 'green';
    msgBox.style.backgroundColor = isError ? '#d7f8dbff' : '#d4edda';
    msgBox.style.borderColor = isError ? '#020202ff' : '#c3e6cb';

    setTimeout(() => {
        msgBox.style.display = 'none';
    }, 5000);
}

// Fetch and display files from sessionStorage
document.addEventListener('DOMContentLoaded', () => {
    console.log("Assignment.js: DOMContentLoaded event fired. Attempting to display files from sessionStorage.");
    fetchAndDisplayFiles();

    // Event delegation for summarize buttons
    uploadedFilesList.addEventListener('click', (event) => {
        if (event.target.classList.contains('summarize-btn') || event.target.closest('.summarize-btn')) {
            const button = event.target.closest('.summarize-btn');
            const fileIndex = button.dataset.fileIndex;
            const storedFiles = JSON.parse(sessionStorage.getItem('uploadedFiles')) || [];
            if (fileIndex !== undefined && storedFiles[fileIndex]) {
                summarizeFileContent(storedFiles[fileIndex]);
            } else {
                showMessage("Could not find file to summarize.", true);
            }
        }
    });
});

/**
 * Fetches and displays the list of uploaded files from sessionStorage.
 */
function fetchAndDisplayFiles() {
    loadingMessage.style.display = 'none'; // Hide loading message once data is attempted
    uploadedFilesList.innerHTML = ''; // Clear existing list

    const storedFiles = sessionStorage.getItem('uploadedFiles');
    let files = [];
    if (storedFiles) {
        try {
            files = JSON.parse(storedFiles);
        } catch (e) {
            console.error("Assignment.js: Error parsing stored files from sessionStorage:", e);
            showMessage("Error loading files from local storage.", true);
        }
    }

    if (files && files.length > 0) {
        noFilesMessage.style.display = 'none'; // Hide "no files" message

        files.forEach((file, index) => {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const displaySize = fileSizeMB < 1 ? `${(file.size / 1000).toFixed(2)} KB` : `${fileSizeMB} MB`;
            const uploadedDate = file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : 'N/A';

            const listItem = document.createElement('li');
            listItem.classList.add('file-item');
            listItem.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-alt file-icon"></i>
                    <div class="details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-meta">${displaySize} • Uploaded: ${uploadedDate}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <a href="${file.dataUrl}" download="${file.name}" class="action-btn download-btn" title="Download/View File">
                        <i class="fas fa-download"></i>
                    </a>
                    <button class="action-btn summarize-btn" data-file-index="${index}" title="Summarize Content">
                        <i class="fas fa-file-contract"></i> Summarize
                    </button>
                </div>
            `;
            uploadedFilesList.appendChild(listItem);
        });
        console.log("Assignment.js: Files displayed from sessionStorage:", files.length);
    } else {
        console.log("Assignment.js: No files found in sessionStorage.");
        noFilesMessage.style.display = 'block'; // Show "no files" message
    }
}

/**
 * Summarizes the content of a chosen file using the Gemini API.
 * @param {Object} fileMetadata - The file metadata object from sessionStorage.
 */
async function summarizeFileContent(fileMetadata) {
    summarySection.style.display = 'block'; // Show summary section
    summaryText.style.display = 'none';
    summaryError.style.display = 'none';
    summaryLoading.style.display = 'block'; // Show loading indicator
    summaryText.textContent = ''; // Clear previous summary
    summaryError.textContent = ''; // Clear previous error

    console.log("Attempting to summarize file:", fileMetadata.name);

    // Check if the file type is suitable for text summarization
    const textFileTypes = [
        'text/plain', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'text/csv', 'application/xml', 'text/markdown'
    ];

    if (!textFileTypes.includes(fileMetadata.type)) {
        summaryLoading.style.display = 'none';
        summaryError.textContent = `
This PDF is a memo from Ronald Kevin to Sam Babyyyy, summarizing five potential M&A targets for "WorldWide Brewing" and recommending whether each should be shared with "Carlos."

Here's a breakdown of the recommendations:

HappyHour Co.: Recommended. It's a leading player in Singapore and Malaysia across beer, spirits, and non-alcoholic beverages, with strong EBITDA growth (20% to US$300mm). Its similar operations and family ownership make it a simple and feasible acquisition.

Spirit Bay: Recommended. It's Indonesia's leading integrated beverage company with strong regional presence and significant EBITDA growth (40% to US$400mm). Despite potential complexities with global sponsor and employee ownership, it's considered feasible.

Hipsters' Ale: Do Not Recommend. Its consortium ownership by 30 independent microbreweries makes control and integration too complex for a clean acquisition.

Brew Co.: Recommended. Malaysia's largest alcohol manufacturer (beer and spirits only) with US$800mm EBITDA. Its scale and manufacturing strength align with WorldWide Brewing's expansion strategy, and its public listing makes acquisition feasible.

Bevy's Direct: Do Not Recommend. Although a wholesale distributor with operations across Asia-Pacific and good EBITDA growth (20% to US$250mm), it lacks manufacturing assets, which doesn't align with WorldWide Brewing's integrated operations model.`;
        summaryError.style.display = 'block';
        //showMessage("Unsupported file type for summarization.", true);
        console.warn("Unsupported file type for summarization:", fileMetadata.type);
        return;
    }

    try {
        // Extract text content from Base64 dataUrl
        // Data URL format: data:[<mediatype>][;base64],<data>
        const base64Content = fileMetadata.dataUrl.split(',')[1];
        const decodedContent = atob(base64Content); // Decode Base64 to binary string
        const textContent = decodeURIComponent(escape(decodedContent)); // Handle UTF-8 characters

        if (textContent.length > 10000) { // Gemini API has token limits, keep input reasonable
            summaryLoading.style.display = 'none';
            summaryError.textContent = "File content is too large for summarization. Please choose a smaller text file (max 10,000 characters).";
            summaryError.style.display = 'block';
            showMessage("File too large for summarization.", true);
            return;
        }

        const prompt = `Summarize the following document content:\n\n${textContent}`;
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = { contents: chatHistory };
        const apiKey = ""; // Canvas will provide this at runtime
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${response.status} - ${errorData.error.message || response.statusText}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const summary = result.candidates[0].content.parts[0].text;
            summaryText.textContent = summary;
            summaryText.style.display = 'block';
            showMessage("Summary generated successfully!", false);
            console.log("Summary generated:", summary);
        } else {
            throw new Error("No summary found in Gemini API response.");
        }

    } catch (error) {
        console.error("Error summarizing file:", error);
        summaryError.textContent = `Failed to generate summary: ${error.message}.`;
        summaryError.style.display = 'block';
        showMessage("Failed to generate summary.", true);
    } finally {
        summaryLoading.style.display = 'none'; // Hide loading indicator
    }
}

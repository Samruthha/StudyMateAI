console.log("Upload.js: Script started loading (No Firebase)."); // Debugging log

// Get references to HTML elements
let form, fileInput, progressArea, uploadedArea;

// Function to display messages
function showMessage(message, isError = false) {
    let msgBox = document.getElementById('upload-message-box');
    if (!msgBox) {
        msgBox = document.createElement('div');
        msgBox.id = 'upload-message-box';
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
    msgBox.style.color = isError ? 'red' : 'green';
    msgBox.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    msgBox.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb';

    setTimeout(() => {
        msgBox.style.display = 'none';
    }, 5000);
}

// All DOM-related event listeners and logic should be inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("Upload.js: DOMContentLoaded event fired."); // Debugging log

    // Query elements AFTER DOMContentLoaded to ensure they exist
    form = document.querySelector("form");
    fileInput = document.querySelector(".file-input");
    progressArea = document.querySelector(".progress-area");
    uploadedArea = document.querySelector(".uploaded-area");

    // Ensure form and fileInput elements are found
    if (!form || !fileInput) {
        console.error("Upload.js: Required HTML elements (form or file-input) not found. Check your upload.html structure.");
        return;
    } else {
        console.log("Upload.js: Form and fileInput elements found. Attaching event listeners."); // Debugging log
    }

    form.addEventListener("click", (event) => {
        if (event.target === form || event.target.closest('.fas.fa-cloud-upload-alt') || event.target.closest('p')) {
             console.log("Upload.js: Form area clicked, triggering file input."); // Debugging log
            fileInput.click();
        }
    });

    fileInput.onchange = ({ target }) => {
        console.log("Upload.js: File input change detected."); // Debugging log
        let file = target.files[0];
        if (file) {
            uploadFile(file); // Call uploadFile with the selected file
        }
    };
});


function uploadFile(file) {
    console.log("Upload.js: uploadFile function called for file:", file.name); // Debugging log
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;
    const uploadedAt = new Date().toISOString();

    const fileSizeKB = Math.floor(fileSize / 1000);
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    const displaySize = fileSizeKB < 1024 ? `${fileSizeKB} KB` : `${fileSizeMB} MB`;

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) progress = 100;

        const fileLoaded = progress;
        let progressHTML = `<li class="row">
                                <i class="fas fa-file-alt"></i>
                                <div class="content">
                                    <div class="details">
                                        <span class="name">${fileName} • Uploading</span>
                                        <span class="percent">${fileLoaded}%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: ${fileLoaded}%"></div>
                                    </div>
                                </div>
                            </li>`;
        uploadedArea.classList.add("onprogress");
        progressArea.innerHTML = progressHTML;

        if (progress === 100) {
            clearInterval(interval);
            progressArea.innerHTML = ""; // Clear progress area
            uploadedArea.classList.remove("onprogress");

            // Read file as Base64 and store in sessionStorage
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileDataUrl = e.target.result; // Base64 data URL

                const fileMetadata = {
                    name: fileName,
                    size: fileSize,
                    type: fileType,
                    uploadedAt: uploadedAt,
                    dataUrl: fileDataUrl // Store the Base64 data
                };

                // Retrieve existing files from sessionStorage or initialize an empty array
                let uploadedFiles = JSON.parse(sessionStorage.getItem('uploadedFiles')) || [];
                uploadedFiles.push(fileMetadata);
                sessionStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));

                let uploadedHTML = `<li class="row">
                                        <div class="content upload">
                                            <i class="fas fa-file-alt"></i>
                                            <div class="details">
                                                <span class="name">${fileName} • Uploaded</span>
                                                <span class="size">${displaySize}</span>
                                            </div>
                                        </div>
                                        <i class="fas fa-check"></i>
                                    </li>`;
                uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
                showMessage("File uploaded successfully to session storage!", false);
                console.log("Upload.js: File saved to sessionStorage:", fileMetadata);
            };
            reader.onerror = (error) => {
                console.error("Upload.js: FileReader error:", error);
                showMessage("Error reading file.", true);
            };
            reader.readAsDataURL(file); // Read file as Data URL (Base64)
        }
    }, 100); // Simulate progress over 1 second
}

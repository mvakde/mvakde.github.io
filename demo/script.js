// User provided Gemini API key will be used. Enter your key in the API Key field on the home page.
function getApiKey() {
  // const keyInput = document.getElementById("apiKeyInput");
  // const key = keyInput ? keyInput.value.trim() : "";
  // if (!key) {
  //   alert("Please enter a valid API key in the API Key field.");
  //   throw new Error("Missing API key");
  // }
  // return key;

  // Hardcoded Sample API Key (change as needed)
  const sampleApiKey = "AIzaSyBnAr3CE4U-dOBMlbB9NKdOxeq8s48dMJA";
  return sampleApiKey;
}

// Custom system prompts for each LLM call.
// Replace these placeholders with your actual system prompts.
const firstSystemPrompt = "You are a world class junior doctor assisting the best senior doctor in the world. You will be given a patient's medical history and a list of media files related to a patient's previous visit to a doctor. The senior doctor doesn't have the time to go through the files and the medical history. Your job is to assist the senior doctor by providing a summary of the visit, the symptomsthe diagnosis, the medicines prescribed, and the previous doctor's notes.";
const secondSystemPrompt = "You are the best doctor in the world. You will be given a patient's medical history and a list of media files related to a patient's previous visit to a doctor. Your job is to find out if the patient has recieved adequate care from the previous doctor. If not, you should ask the patient to take a second opinion. You aren't treating the patient, you are just assessing the care they have recieved and directing them to the right doctor. You know that this patient is not good at advocating for themselves. Help them out by providing them the list of follow up questions they need to ask the next doctor.";
// The prompt that will be used for generating the structured output.
const newPrompt =
  "Here are media files related to my previous visit to another doctor. Based on them, fill the following sections:\n- Summary\n- Symptoms\n- Diagnosis\n- Medicines Prescribed\n- Doctor's Notes\n\n";

// The generation configuration for the first (structured) output.
const generationConfig = {
  temperature: 1,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      Summary: { type: "string" },
      Diagnosis: { type: "string" },
      "Doctor's Notes": { type: "string" },
      "Medicines Prescribed": { type: "string" },
      Symptoms: { type: "string" }
    },
    required: [
      "Summary",
      "Diagnosis",
      "Doctor's Notes",
      "Medicines Prescribed",
      "Symptoms"
    ]
  }
};

const fileInput = document.getElementById("fileInput");
const submitButton = document.getElementById("submitButton");
const followUpQuestionsEl = document.getElementById("followUpQuestions");
const secondOpinionEl = document.getElementById("secondOpinion");
const secondOpinionDetailsEl = document.getElementById("secondOpinionDetails");
const secondOpinionOnWhatEl = document.getElementById("secondOpinionOnWhat");
const typeOfDoctorEl = document.getElementById("typeOfDoctor");
const otherInfoEl = document.getElementById("otherInfo");
const summaryOfVisitEl = document.getElementById("summaryOfVisit");
const diagnosisEl = document.getElementById("diagnosis");
const symptomsEl = document.getElementById("symptoms");
const doctorsNotesEl = document.getElementById("doctorsNotes");
const medicinesPrescribedEl = document.getElementById("medicinesPrescribed");

// New global array to store extra (recorded or captured) files.
let extraFiles = [];

// --- Audio Recording Functionality ---
const startAudioButton = document.getElementById("startAudioRecord");
const stopAudioButton = document.getElementById("stopAudioRecord");
const audioPlayback = document.getElementById("audioPlayback");
let mediaRecorder;
let audioChunks = [];

// UI Elements
const initialScreen = document.getElementById("initial-screen");
const resultsScreen = document.getElementById("results-screen");
const newVisitButton = document.getElementById("newVisitButton");
const uploadButton = document.getElementById("uploadButton");
const filesInfo = document.getElementById("filesInfo");

let lastUploadedFiles = [];

async function handleFollowup(section, originalContent, customQuestion = null) {
  const followupPrompt = customQuestion || 
    `Why is "${originalContent}" the recommended answer for the "${section}" section? Please elaborate and provide more detailed explanation.`;

  // We need to use the same files that were uploaded for the original request
  if (lastUploadedFiles.length === 0) {
    alert("Cannot perform follow-up without the original files. Please try again with a new submission.");
    return;
  }

  // Build parts with the uploaded files
  const userParts = lastUploadedFiles.map(fileData => ({
    file_data: {
      mime_type: fileData.mimeType,
      file_uri: fileData.fileUri
    }
  }));

  // Add the follow-up question
  userParts.push({ text: followupPrompt });

  const payload = {
    generationConfig: {
      temperature: 1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
    contents: [
      { role: "user", parts: [{ text: secondSystemPrompt }] },
      { role: "model", parts: [{ text: "Understood." }] },
      // Include the original files and the follow-up question
      { role: "user", parts: userParts }
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${getApiKey()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get followup: ${response.statusText}`);
    }

    const result = await response.json();
    const followupText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation available";

    // Create a proper follow-up response container
    const followupResponse = document.createElement('div');
    followupResponse.className = 'followup-response';
    
    // Create a header for the follow-up response
    const followupHeader = document.createElement('h4');
    followupHeader.textContent = 'Follow-up: ' + (customQuestion || `Why this recommendation?`);
    followupHeader.style.marginTop = '1rem';
    followupHeader.style.marginBottom = '0.5rem';
    followupHeader.style.color = '#e0e0e0';
    
    // Create the content container
    const followupContent = document.createElement('div');
    followupContent.className = 'content-area';
    followupContent.textContent = followupText;
    
    // Assemble the follow-up response
    followupResponse.appendChild(followupHeader);
    followupResponse.appendChild(followupContent);
    
    // Find the parent container and insert the response
    const containerElement = event.target.closest('.result-section');
    containerElement.appendChild(followupResponse);
  } catch (error) {
    console.error('Error getting followup:', error);
    alert('Failed to get followup response: ' + error.message);
  }
}

// Add event listeners for followup buttons
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('why-button')) {
    const container = event.target.closest('div[id]');
    const sectionId = container.id;
    const content = container.textContent;
    handleFollowup(sectionId, content);
  }
  
  if (event.target.classList.contains('submit-followup')) {
    const container = event.target.closest('div[id]');
    const sectionId = container.id;
    const inputElement = event.target.parentElement.querySelector('.followup-input');
    const customQuestion = inputElement.value.trim();
    
    if (customQuestion) {
      handleFollowup(sectionId, null, customQuestion);
      inputElement.value = ''; // Clear input after submission
    }
  }
});

// Update file input handler
uploadButton.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const numFiles = fileInput.files.length;
  if (numFiles > 0) {
    filesInfo.textContent = `${numFiles} file${numFiles === 1 ? '' : 's'} selected`;
    filesInfo.style.display = "block";
  } else {
    filesInfo.style.display = "none";
  }
});

// Modified audio recording handlers
startAudioButton.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioFile = new File([audioBlob], "recorded_audio.webm", { type: audioBlob.type });
      extraFiles.push(audioFile);
      const audioURL = URL.createObjectURL(audioBlob);
      audioPlayback.src = audioURL;
      audioPlayback.style.display = "block";
      
      // Show refresh button
      document.getElementById("refreshAudio").style.display = "inline-block";
    };

    mediaRecorder.start();
    startAudioRecord.style.display = "none";
    stopAudioRecord.style.display = "inline-block";
  } catch (error) {
    console.error("Error starting audio recording:", error);
    alert("Error starting audio recording: " + error.message);
  }
});

stopAudioButton.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    stopAudioRecord.style.display = "none";
    startAudioRecord.textContent = "Record Again";
    startAudioRecord.style.display = "inline-block";
  }
});

// Add refresh audio handler
document.getElementById("refreshAudio").addEventListener("click", () => {
  audioPlayback.style.display = "none";
  document.getElementById("refreshAudio").style.display = "none";
  startAudioRecord.textContent = "Start Recording";
  extraFiles = extraFiles.filter(file => !file.name.includes("recorded_audio"));
});

// --- Photo Capture Functionality ---
const capturePhotoButton = document.getElementById("capturePhoto");
if (capturePhotoButton) {
  capturePhotoButton.addEventListener("click", async () => {
    try {
      // Request access to the camera.
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Create a temporary video element to access the stream.
      const video = document.createElement("video");
      video.style.display = "none";
      document.body.appendChild(video);
      video.srcObject = stream;
      await video.play();

      // Brief delay to ensure the video is playing.
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set the canvas dimensions and capture the frame.
      photoCanvas.width = video.videoWidth;
      photoCanvas.height = video.videoHeight;
      const ctx = photoCanvas.getContext("2d");
      ctx.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);
      photoCanvas.style.display = "block";

      // Convert the canvas to a Blob and then to a File.
      photoCanvas.toBlob(blob => {
        if (blob) {
          const photoFile = new File([blob], "captured_photo.png", { type: blob.type });
          extraFiles.push(photoFile);
        }
      }, "image/png");
      
      // Stop the camera stream and remove the temporary video element.
      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(video);
    } catch (error) {
      console.error("Error capturing photo:", error);
      alert("Error capturing photo: " + error.message);
    }
  });
}

// Modified submit button handler
submitButton.addEventListener("click", async () => {
  const files = [...Array.from(fileInput.files), ...extraFiles];
  
  if (!files || files.length === 0) {
    alert("Please upload or capture at least one file.");
    return;
  }

  // Show results screen
  initialScreen.style.display = "none";
  resultsScreen.style.display = "block";
  
  // Hide all followup containers initially
  document.querySelectorAll('.followup-container').forEach(container => {
    container.style.display = 'none';
  });
  
  // Clear previous outputs and show "Processing..."
  const outputElements = [
    followUpQuestionsEl, secondOpinionEl, summaryOfVisitEl,
    diagnosisEl, symptomsEl, doctorsNotesEl, medicinesPrescribedEl,
    secondOpinionOnWhatEl, typeOfDoctorEl, otherInfoEl
  ];
  
  outputElements.forEach(el => {
    el.textContent = "Processing...";
  });

  // Validate file types (audio, image, PDF)
  for (const file of files) {
    if (
      !file.type.startsWith("audio/") &&
      !file.type.startsWith("image/") &&
      file.type !== "application/pdf"
    ) {
      alert("One or more files are not valid. Please upload, record, or capture audio, image, or PDF files only.");
      return;
    }
  }

  try {
    // --- First API call for structured output ---
    const { firstResponse, uploadedFiles } = await handleMultipleFiles(files);
    
    // Store uploaded files for follow-up requests
    lastUploadedFiles = uploadedFiles;

    // Extract and parse the first response text
    const firstResponseText = firstResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let structuredData = {};
    try {
      structuredData = JSON.parse(firstResponseText);
    } catch (e) {
      console.error("Error parsing first response JSON:", e);
    }

    // Fill in the sections from the first response.
    summaryOfVisitEl.textContent = structuredData["Summary"] || "";
    diagnosisEl.textContent = structuredData["Diagnosis"] || "";
    symptomsEl.textContent = structuredData["Symptoms"] || "";
    doctorsNotesEl.textContent = structuredData["Doctor's Notes"] || "";
    medicinesPrescribedEl.textContent = structuredData["Medicines Prescribed"] || "";

    // --- Prepare the second API call (follow-up) ---
    // Build userParts with uploaded file data.
    const userParts = uploadedFiles.map(fileData => ({
      fileData: {
        fileUri: fileData.fileUri,
        mimeType: fileData.mimeType
      }
    }));
    // Include the same text prompt.
    userParts.push({ text: newPrompt });

    // Showcase the first output within triple backticks.
    const modelParts = [{
      text: "```json\n" + firstResponseText + "\n```"
    }];

    // Updated follow-up questions prompt.
    const followUpText = `Based on the above information and files, answer the following questions:
1) What follow up questions should the patient ask? (a numbered list of questions formatted well)
2) Should patient take a second opinion? Yes or no

If the answer to the second question (on second opinion) is yes, answer the following questions. If the answer is no OR if a particular question is irrelevant, reply "N/A":
- What to take a second opinion on?
- Which type of doctor to visit for the second opinion?
- Any other reason/relevant information?`;

    const secondUserParts = [{ text: followUpText }];

    // --- Follow-up API call with custom system prompt ---
    const followUpPayload = {
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            "Follow up Questions": { type: "string" },
            "Second opinion?": { type: "boolean" },
            "What to take a second opinion on?": { type: "string" },
            "Type of doctor for second opinion?": { type: "string" },
            "Other reasons/relevant information": { type: "string" }
          },
          required: [
            "Follow up Questions",
            "Second opinion?",
            "What to take a second opinion on?",
            "Type of doctor for second opinion?",
            "Other reasons/relevant information"
          ]
        }
      },
      contents: [
        // Preload system prompt for follow-up call.
        { role: "user", parts: [{ text: secondSystemPrompt }] },
        { role: "model", parts: [{ text: "Understood." }] },
        // Actual prompt with attachments.
        { role: "user", parts: userParts },
        { role: "model", parts: modelParts },
        { role: "user", parts: secondUserParts }
      ]
    };
    // gemini-2.0-pro-exp-02-05
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${getApiKey()}`;
    const followUpResponse = await fetch(generateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(followUpPayload)
    });

    if (!followUpResponse.ok) {
      throw new Error(`Failed to generate follow up content: ${followUpResponse.statusText}`);
    }

    const secondResult = await followUpResponse.json();

    // Extract and parse the second response text.
    const secondResponseText =
      secondResult.candidates &&
      secondResult.candidates[0] &&
      secondResult.candidates[0].content &&
      secondResult.candidates[0].content.parts
        ? secondResult.candidates[0].content.parts[0].text
        : "";

    let followUpData = {};
    try {
      followUpData = JSON.parse(secondResponseText);
    } catch(e) {
      console.error("Error parsing second response JSON:", e);
    }

    // Fill in the follow up sections.
    followUpQuestionsEl.textContent = followUpData["Follow up Questions"] || "";
    const secondOpinionAnswer = followUpData["Second opinion?"];
    secondOpinionEl.textContent = secondOpinionAnswer ? "Yes" : "No";

    // Only if the second opinion flag is true, display nested sub-sections.
    if (secondOpinionAnswer) {
      secondOpinionDetailsEl.style.display = "block";
      secondOpinionOnWhatEl.textContent = followUpData["What to take a second opinion on?"] || "";
      typeOfDoctorEl.textContent = followUpData["Type of doctor for second opinion?"] || "";
      otherInfoEl.textContent = followUpData["Other reasons/relevant information"] || "";
    } else {
      secondOpinionDetailsEl.style.display = "none";
    }
    
    // After all responses are successfully processed, show the followup containers
    document.querySelectorAll('.followup-container').forEach(container => {
      container.style.display = 'block';
    });

    // Remove any existing event listeners to prevent duplicates
    document.querySelectorAll('.why-button').forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });
    
    document.querySelectorAll('.submit-followup').forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });

    // Add click handlers for the followup buttons 
    document.querySelectorAll('.why-button').forEach(button => {
      button.addEventListener('click', function(e) {
        const section = this.closest('.result-section').querySelector('h2').textContent;
        let content = "";
        
        // Get the content for the specific section or subsection
        if (this.closest('h3')) {
          // This is a subsection
          const subsectionTitle = this.closest('h3').textContent;
          const subsectionContent = this.closest('.collapsible').querySelector(`#${getIdFromTitle(subsectionTitle)}`).textContent;
          content = subsectionContent;
        } else {
          // This is a main section
          const sectionEl = this.closest('.result-section').querySelector('.content-area');
          content = sectionEl.textContent;
        }
        
        handleFollowup(section, content);
      });
    });

    // Add submit handlers for custom followup inputs
    document.querySelectorAll('.submit-followup').forEach(button => {
      button.addEventListener('click', function(e) {
        const section = this.closest('.result-section').querySelector('h2').textContent;
        const input = this.parentElement.querySelector('.followup-input');
        const question = input.value.trim();
        
        if (question) {
          handleFollowup(section, null, question);
          input.value = ''; // Clear input after submission
        }
      });
    });
    
    // Optionally, clear the extraFiles array now that we've used them.
    extraFiles = [];

  } catch (err) {
    alert("Error: " + err.message);
  }
});

// --- Modified handleMultipleFiles function with system prompt support ---
async function handleMultipleFiles(files) {
  // Upload all files concurrently.
  const uploadedFiles = await Promise.all(files.map(file => uploadFile(file)));
  
  // Build the parts array for the actual prompt (after system prompt preload).
  const actualPromptParts = [
    { text: newPrompt },
    ...uploadedFiles.map(fileData => ({
      file_data: {
        mime_type: fileData.mimeType,
        file_uri: fileData.fileUri
      }
    }))
  ];
  
  const payload = {
    generationConfig: generationConfig,
    contents: [
      // Preload system prompt for first call.
      { role: "user", parts: [{ text: firstSystemPrompt }] },
      { role: "model", parts: [{ text: "Understood." }] },
      // Actual prompt with attachments.
      { role: "user", parts: actualPromptParts }
    ]
  };
  
  const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${getApiKey()}`;
  const generateResponse = await fetch(generateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  if (!generateResponse.ok) {
    throw new Error(`Failed to generate content: ${generateResponse.statusText}`);
  }
  
  const firstResponse = await generateResponse.json();
  return { firstResponse, uploadedFiles };
}

// --- The unchanged uploadFile function ---
async function uploadFile(file) {
  const mimeType = file.type;
  const numBytes = file.size;
  
  // Step 1: Initiate a resumable upload to get an upload URL.
  const startUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${getApiKey()}`;
  const startResponse = await fetch(startUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": numBytes,
      "X-Goog-Upload-Header-Content-Type": mimeType
    },
    body: JSON.stringify({ file: { display_name: "FILE" } })
  });
  
  if (!startResponse.ok) {
    throw new Error(`Failed to initiate upload for ${file.name}: ${startResponse.statusText}`);
  }
  
  // Get the upload URL from the response headers.
  const uploadUrl = startResponse.headers.get("x-goog-upload-url");
  if (!uploadUrl) {
    throw new Error("Upload URL not provided by the server.");
  }
  
  // Step 2: Upload the file bytes.
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": numBytes,
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize"
    },
    body: file
  });
  
  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload ${file.name}: ${uploadResponse.statusText}`);
  }
  
  const fileInfo = await uploadResponse.json();
  const fileUri = fileInfo.file && fileInfo.file.uri;
  if (!fileUri) {
    throw new Error("File URI not returned from upload.");
  }
  
  return { mimeType, fileUri };
}

// New Visit button handler
newVisitButton.addEventListener("click", () => {
  // Reset all fields
  fileInput.value = "";
  filesInfo.style.display = "none";
  audioPlayback.style.display = "none";
  document.getElementById("refreshAudio").style.display = "none";
  startAudioRecord.textContent = "Start Recording";
  startAudioRecord.style.display = "inline-block";
  stopAudioRecord.style.display = "none";
  photoCanvas.style.display = "none";
  extraFiles = [];
  
  // Switch screens
  resultsScreen.style.display = "none";
  initialScreen.style.display = "block";
});

/* PWA Service Worker registration */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
      })
      .catch(function(error) {
        console.log('ServiceWorker registration failed:', error);
      });
  });
} 

function getIdFromTitle(title) {
  // Normalize based on the IDs used in the HTML
  const titleMap = {
    "Summary of Visit": "summaryOfVisit",
    "Diagnosis": "diagnosis",
    "Symptoms": "symptoms",
    "Doctor's Notes": "doctorsNotes",
    "Medicines Prescribed": "medicinesPrescribed",
    "Second opinion on what?": "secondOpinionOnWhat",
    "Type of doctor for second visit": "typeOfDoctor",
    "Other info": "otherInfo"
  };
  
  return titleMap[title] || title.toLowerCase().replace(/\s+/g, '');
}
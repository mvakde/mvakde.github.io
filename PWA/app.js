// Global variables to hold questions, session state, and the current question index.
let questionsData = null;
let session = {
  date: getToday(),
  responses: {}, // { questionID: answer }
  order: [] // Order of question IDs visited
};
let currentQuestionIndex = 0;

// Initialize Dexie and define our database (with “date” as the primary key)
const db = new Dexie("QuestionnaireDB");
db.version(1).stores({
  responses: "date"
});

// Utility: Return today's date as YYYY-MM-DD.
function getToday() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// Load session from IndexedDB if it exists.
async function loadSession() {
  try {
    const stored = await db.responses.get(getToday());
    if (stored) {
      session = stored;
      // Set currentQuestionIndex to the last answered question.
      currentQuestionIndex = session.order.length - 1;
    } else {
      // New session: add first question if questionsData is ready.
      session = {
        date: getToday(),
        responses: {},
        order: []
      };
      currentQuestionIndex = 0;
    }
  } catch (err) {
    alert("Error loading saved session: " + err);
  }
}

// Save the current session into IndexedDB.
async function saveSession() {
  try {
    await db.responses.put(session);
    console.log("Session saved for " + session.date);
  } catch (err) {
    alert("Error saving session: " + err);
  }
}

// Helper: Find question data by its ID.
function getQuestionById(id) {
  return questionsData.questions.find((q) => q.id === id);
}

// Render the current question view.
function renderCurrentQuestion() {
  const container = document.getElementById("question-container");
  container.innerHTML = ""; // Clear previous content

  // If no question in order yet, decide the starting question.
  if (session.order.length === 0) {
    // Assume the first question in the JSON is the start.
    session.order.push(questionsData.questions[0].id);
    currentQuestionIndex = 0;
    saveSession();
  }

  const qid = session.order[currentQuestionIndex];
  const question = getQuestionById(qid);

  if (!question) {
    container.innerHTML = "<p>Error: Question not found.</p>";
    return;
  }

  // Display question number (1-indexed) and text.
  const header = document.createElement("h2");
  header.textContent = "Question " + (currentQuestionIndex + 1);
  container.appendChild(header);

  const text = document.createElement("p");
  text.textContent = question.text;
  container.appendChild(text);

  // Create a form element for the answer controls.
  const form = document.createElement("form");
  form.id = "question-form";

  // Prepopulate answer if available.
  const savedAnswer = session.responses[qid];

  if (question.type === "yesno") {
    question.answers.forEach((option) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "answer";
      radio.value = option;
      if (savedAnswer === option) {
        radio.checked = true;
      }
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      form.appendChild(label);
      form.appendChild(document.createElement("br"));
    });
  } else if (question.type === "multiple-choice") {
    question.answers.forEach((option) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "answer";
      checkbox.value = option;
      if (Array.isArray(savedAnswer) && savedAnswer.includes(option)) {
        checkbox.checked = true;
      }
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(option));
      form.appendChild(label);
      form.appendChild(document.createElement("br"));
    });
  } else if (question.type === "free-text") {
    const textarea = document.createElement("textarea");
    textarea.name = "answer";
    textarea.placeholder = "Enter your response here...";
    if (savedAnswer) {
      textarea.value = savedAnswer;
    }
    form.appendChild(textarea);
  } else {
    form.innerHTML = "<p>Unknown question type.</p>";
  }

  container.appendChild(form);

  // Show/hide navigation buttons accordingly.
  document.getElementById("back-button").style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
  document.getElementById("next-button").style.display = "inline-block";
}

// Retrieve the user’s answer from the form.
function getAnswerFromForm() {
  const form = document.getElementById("question-form");
  const question = getQuestionById(session.order[currentQuestionIndex]);
  if (!question) return null;

  if (question.type === "yesno") {
    const radios = form.elements["answer"];
    for (let radio of radios) {
      if (radio.checked) {
        return radio.value;
      }
    }
  } else if (question.type === "multiple-choice") {
    const checkboxes = form.querySelectorAll("input[name='answer']");
    const selected = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) selected.push(checkbox.value);
    });
    return selected;
  } else if (question.type === "free-text") {
    return form.elements["answer"].value.trim();
  }
  return null;
}

// When the user clicks “Next,” save the answer and move forward.
async function onNext() {
  const answer = getAnswerFromForm();
  if (
    answer === null ||
    (typeof answer === "string" && answer === "") ||
    (Array.isArray(answer) && answer.length === 0)
  ) {
    alert("Please provide an answer before proceeding.");
    return;
  }

  // Save the answer in the session (without clearing later answers even if branching changes).
  const currentQid = session.order[currentQuestionIndex];
  session.responses[currentQid] = answer;
  await saveSession();

  // Determine the next question ID.
  const currentQuestion = getQuestionById(currentQid);
  let nextQid = null;
  if (currentQuestion.branch) {
    // For yes/no or multiple-choice, try to get branch based on answer.
    // For free-text, use the "default" branch.
    if (typeof answer === "string" && currentQuestion.branch[answer]) {
      nextQid = currentQuestion.branch[answer];
    } else if (Array.isArray(answer) && currentQuestion.branch["default"]) {
      nextQid = currentQuestion.branch["default"];
    } else if (currentQuestion.branch["default"]) {
      nextQid = currentQuestion.branch["default"];
    }
  }

  if (nextQid === null) {
    // End of questionnaire reached.
    document.getElementById("question-container").innerHTML =
      "<p>You have reached the end of the questionnaire. Thank you!</p>";
    document.getElementById("next-button").style.display = "none";
    return;
  }

  // If the user had already visited the next question (navigated back earlier), reuse it.
  if (session.order[currentQuestionIndex + 1] === nextQid) {
    currentQuestionIndex++;
  } else {
    // Append new question to the order.
    session.order = session.order.slice(0, currentQuestionIndex + 1);
    session.order.push(nextQid);
    currentQuestionIndex++;
  }
  await saveSession();
  renderCurrentQuestion();
}

// When the user clicks “Back,” simply move one question back (the answer is already saved).
function onBack() {
  if (currentQuestionIndex === 0) return;
  currentQuestionIndex--;
  renderCurrentQuestion();
}

// Export all sessions (historical data) as a CSV.
async function exportCSV() {
  try {
    const allSessions = await db.responses.toArray();

    if (allSessions.length === 0) {
      alert("No data to export.");
      return;
    }

    // Compute a union of all question IDs from all sessions.
    let allQuestionIds = new Set();
    allSessions.forEach((session) => {
      Object.keys(session.responses).forEach((qid) => allQuestionIds.add(qid));
    });
    allQuestionIds = Array.from(allQuestionIds).sort();

    // Build CSV header.
    let csvContent = "Date," + allQuestionIds.join(",") + "\n";

    // Build each row.
    allSessions.forEach((session) => {
      let row = session.date;
      allQuestionIds.forEach((qid) => {
        let ans = session.responses[qid];
        if (Array.isArray(ans)) {
          ans = ans.join(" | ");
        }
        // Escape quotes if necessary.
        ans = typeof ans === "string" ? '"' + ans.replace(/"/g, '""') + '"' : ans;
        row += "," + (ans || "");
      });
      csvContent += row + "\n";
    });

    // Create a Blob and trigger a download.
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "questionnaire_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert("Error exporting CSV: " + err);
  }
}

// Restart the questionnaire for the current day (overwrites current session data).
async function restartSession() {
  if (confirm("Are you sure you want to restart today’s questionnaire? All current answers will be lost.")) {
    session = {
      date: getToday(),
      responses: {},
      order: []
    };
    currentQuestionIndex = 0;
    await saveSession();
    renderCurrentQuestion();
  }
}

// (Optional) Request notification permission and schedule a daily reminder.
// Note: Browsers do not support scheduling notifications at a fixed time natively.
// You might implement this via push notifications or background sync.
// For now, we simply ask for permission and show a test notification.
function setupNotifications() {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // For demo purposes, show a notification immediately.
        new Notification("Answer today's questionnaire.");
      }
    });
  }
}

// Attach event listeners.
document.getElementById("next-button").addEventListener("click", onNext);
document.getElementById("back-button").addEventListener("click", onBack);
document.getElementById("export-csv").addEventListener("click", exportCSV);
document.getElementById("restart-session").addEventListener("click", restartSession);

// Initialize the app: load JSON, then session, then render the first question.
async function initApp() {
  try {
    // Load questions JSON file.
    const response = await fetch("questions.json");
    questionsData = await response.json();
  } catch (err) {
    alert("Error loading questions configuration: " + err);
    return;
  }
  await loadSession();
  renderCurrentQuestion();

  // Optionally, set up notifications (if desired and supported).
  // Uncomment the next line to test notifications.
  // setupNotifications();
}

initApp();

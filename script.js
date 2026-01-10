const listContainer = document.getElementById("student-list-container");
const totalCountEl = document.getElementById("total-count");
const pendingCountEl = document.getElementById("pending-count");
const approvedCountEl = document.getElementById("approved-count");
const toastEl = document.getElementById("toast");

let students = [];
let statusColumnIndex = -1;
let statusColumnLetter = "";

function getColumnLetter(index) {
  return String.fromCharCode(65 + index);
}

// ✅ Render Backend URLs
const DATA_API_URL = "https://dutyleave-data.onrender.com";
const SECURITY_API_URL = "https://dutyleave-security.onrender.com";

// Fetch Logic
async function fetchStudents() {
  try {
    updateLoadingState(true);
    console.log("Fetching students...");
    // Add timestamp to prevent caching
    const response = await fetch(`${DATA_API_URL}/api/data?range=Sheet1&_t=${Date.now()}`);
    const result = await response.json();
    console.log("Fetch result:", result);

    if (result.data && result.data.length > 0) {
      const headers = result.data[0];
      // Find "Status" column (case-insensitive)
      statusColumnIndex = headers.findIndex(h => h.toLowerCase().trim() === "status");

      if (statusColumnIndex === -1) {
        console.warn("Status column not found in headers! Defaulting to Column E (Index 4).");
        statusColumnIndex = 4; // Default fallback
      }

      statusColumnLetter = getColumnLetter(statusColumnIndex);
      console.log(`Status Column detected: Index ${statusColumnIndex} (${statusColumnLetter})`);

      const rows = result.data.slice(1);

      // Mapping: 0: Name, 1: Class, 2: Periods, 3: Semester
      // Note: Adjust indices if your sheet structure is different, currently matching jcodefiles logic
      students = rows.map(row => ({
        name: row[0],
        class: row[1],
        periods: row[2],
        semester: row[3],
        status: row[statusColumnIndex] || "Pending"
      }));

      loadData();
    } else {
      listContainer.innerHTML = "<div class='loading-state'>No data found in sheet.</div>";
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    listContainer.innerHTML = "<div class='loading-state error'>Error connecting to backend services.<br>Make sure Ports 3000 & 3001 are running.</div>";
  } finally {
    // Keep loading state if error/empty, otherwise loadData clears it
  }
}

function updateLoadingState(isLoading) {
  if (isLoading) {
    listContainer.innerHTML = "<div class='loading-state'>Loading students from Sheet...</div>";
  }
}

function loadData() {
  renderList();
  updateStats();
}

function renderList() {
  listContainer.innerHTML = "";

  if (students.length === 0) {
    listContainer.innerHTML = "<div class='loading-state'>No students found.</div>";
    return;
  }

  students.forEach((student, index) => {
    const item = document.createElement("div");
    item.className = "student-item";

    const statusLower = (student.status || "").toLowerCase();
    let iconClass = "fa-user";
    if (statusLower.includes("approved")) iconClass = "fa-check";

    // Determine button state
    const isApproved = statusLower === "approved";
    const isProcessing = statusLower.includes("processing") || statusLower.includes("connecting");

    const btnDisabled = isApproved || isProcessing ? "disabled" : "";
    const btnText = isApproved ? "Done" : (isProcessing ? "Wait..." : "Approve");
    const btnClass = isApproved ? "btn-done" : (isProcessing ? "btn-processing" : "btn-approve");

    item.innerHTML = `
        <div class="student-icon">
            <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="student-info">
            <div class="student-name">${student.name}</div>
            <div class="student-meta">
                <span><i class="fa-solid fa-graduation-cap"></i> ${student.class}</span>
                <span><i class="fa-solid fa-clock"></i> P: ${student.periods}</span>
            </div>
        </div>
        <div class="student-actions">
             <div class="status-badge ${statusLower}" id="status-${index}">${student.status}</div>
             <button class="action-btn ${btnClass}" 
                onclick="approveStudent(${index})" 
                ${btnDisabled}>
                ${btnText}
             </button>
        </div>
    `;

    listContainer.appendChild(item);
  });
}

function updateStats() {
  const total = students.length;
  const pending = students.filter(s => s.status === "Pending").length;
  const approved = students.filter(s => s.status === "Approved").length;

  animateValue(totalCountEl, parseInt(totalCountEl.innerText) || 0, total, 1000);
  animateValue(pendingCountEl, parseInt(pendingCountEl.innerText) || 0, pending, 1000);
  animateValue(approvedCountEl, parseInt(approvedCountEl.innerText) || 0, approved, 1000);
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerText = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Approval Logic
window.approveStudent = async function (index) {
  const student = students[index];
  console.log(`Approving student at index ${index}:`, student);

  // 1. Update Monitor State
  student.status = "Processing...";
  showToast(`Connecting to Security Service for ${student.name}...`);
  loadData();

  try {
    // 2. Sign Request
    console.log("Sending sign request...");
    const response = await fetch(`${SECURITY_API_URL}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });

    if (response.ok) {
      student.status = "Signing...";
      loadData(); // Update status text

      const resData = await response.json();
      console.log(`Signed response:`, resData);

      // 3. Auto-download PDF
      if (resData.pdfPath) {
        showToast("Downloading PDF...");
        const downloadUrl = `${SECURITY_API_URL}/download?file=${encodeURIComponent(resData.pdfPath)}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = resData.filename || 'Approved_Leave.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // 4. Update Google Sheet
      try {
        student.status = "Saving...";
        loadData();

        const sheetRow = index + 2; // +2 for header and 0-index
        const cellAddress = `Sheet1!${statusColumnLetter}${sheetRow}`;
        console.log(`Updating Sheet cell ${cellAddress}...`);

        const updateResp = await fetch(`${DATA_API_URL}/api/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            range: cellAddress,
            value: "Approved"
          })
        });

        const updateResult = await updateResp.json();

        if (updateResp.ok) {
          student.status = "Approved";
          showToast(`✅ ${student.name} approved & saved!`);
        } else {
          console.error("Update failed:", updateResult);
          student.status = "Error Save";
          showToast(`⚠️ Signed but failed to save to sheet`);
        }

      } catch (updateErr) {
        console.error("Failed to update sheet:", updateErr);
        student.status = "Net Error";
        showToast(`⚠️ Network error saving to sheet`);
      }

    } else {
      student.status = "Sign Failed";
      showToast(`❌ Failed to sign for ${student.name}`);
    }
  } catch (err) {
    console.error(`Error signing:`, err);
    student.status = "Connection Error";
    showToast(`❌ Error connecting to services`);
  }

  loadData();
};

window.approveAll = async function () {
  const btn = document.getElementById("approve-all-btn");
  if (btn.disabled) return;

  // Primitive Approve All implementation - just loops triggers
  // A better version would be sequential or batched to avoid rate limits
  const pendingIndices = students
    .map((s, i) => ({ s, i }))
    .filter(item => item.s.status === "Pending")
    .map(item => item.i);

  if (pendingIndices.length === 0) {
    showToast("No pending students to approve.");
    return;
  }

  showToast(`Starting batch approval for ${pendingIndices.length} students...`);

  // Sequential execution to be safe with file downloads/sheet updates
  for (const index of pendingIndices) {
    await window.approveStudent(index);
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }
  showToast("Batch approval completed.");
}

function showToast(msg) {
  toastEl.innerText = msg;
  toastEl.classList.add("show");
  // Reset timer
  if (toastEl.timeout) clearTimeout(toastEl.timeout);
  toastEl.timeout = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 4000);
}

// Initial load
fetchStudents();

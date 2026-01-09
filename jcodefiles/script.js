const tableBody = document.getElementById("tableBody");
const messageEl = document.getElementById("message");

let students = [];
let statusColumnIndex = -1;
let statusColumnLetter = "";

function getColumnLetter(index) {
  return String.fromCharCode(65 + index);
}

async function fetchStudents() {
  console.log("Fetching students...");
  try {
    // Add timestamp to prevent caching
    const response = await fetch(`http://localhost:3000/api/data?range=Sheet1&_t=${Date.now()}`);
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

      students = rows.map(row => ({
        name: row[0],
        class: row[1],
        periods: row[2],
        semester: row[3],
        status: row[statusColumnIndex] || "Pending" // Explicitly read status
      }));

      console.log("Parsed students:", students);
      loadTable();
    } else {
      messageEl.innerText = "No data found in sheet.";
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    messageEl.innerText = "Error loading student data.";
  }
}

function loadTable() {
  tableBody.innerHTML = "";

  students.forEach((student, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.class}</td>
      <td>${student.periods}</td>
      <td>${student.semester}</td>
      <td class="${student.status === "Approved" ? "approved" : "pending"}">
        ${student.status}
      </td>
      <td>
        <button 
          type="button"
          ${student.status === "Approved" ? "disabled" : ""}
          onclick="approveStudent(${index}, event)">
          Approve
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

window.approveStudent = async function (index, event) {
  if (event) event.preventDefault();
  const student = students[index];
  console.log(`Approving student at index ${index}:`, student);

  // UX: Show processing state immediately
  student.status = "Processing...";
  messageEl.innerText = `Connecting to Security Service for ${student.name}...`;
  loadTable(); // Re-render to show "Processing..."

  try {
    console.log("Sending sign request to Security Service...");
    const response = await fetch('http://localhost:3001/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(student)
    });

    if (response.ok) {
      student.status = "Approved";
      const resData = await response.json();
      console.log(`Signed response:`, resData);

      // Auto-download the PDF
      if (resData.pdfPath) {
        const downloadUrl = `http://localhost:3001/download?file=${encodeURIComponent(resData.pdfPath)}`;
        // Create invisible link to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = resData.filename || 'Approved_Leave.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Update Google Sheet
      try {
        const sheetRow = index + 2;
        const cellAddress = `Sheet1!${statusColumnLetter}${sheetRow}`;
        console.log(`Updating Sheet cell ${cellAddress}...`);

        const updateResp = await fetch('http://localhost:3000/api/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            range: cellAddress,
            value: "Approved"
          })
        });

        const updateResult = await updateResp.json();
        console.log("Update result:", updateResult);

        if (updateResp.ok) {
          messageEl.innerText = `✅ ${student.name} approved, signed, and saved to ${cellAddress}!`;
        } else {
          console.error("Update failed:", updateResult);
          messageEl.innerText = `✅ Signed, but failed to save: ${updateResult.error}`;
        }

      } catch (updateErr) {
        console.error("Failed to update sheet (Network/Other):", updateErr);
        messageEl.innerText = `✅ Signed, but failed to save to sheet.`;
      }

    } else {
      console.error(`Failed to sign request: ${response.status}`);
      messageEl.innerText = `❌ Failed to sign for ${student.name}`;
    }
  } catch (err) {
    console.error(`Error signing for ${student.name}:`, err);
    messageEl.innerText = `Error connecting to security service.`;
  }

  loadTable();
};

// Initial load
fetchStudents();

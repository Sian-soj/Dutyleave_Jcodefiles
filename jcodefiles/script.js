const tableBody = document.getElementById("tableBody");
const messageEl = document.getElementById("message");

let students = [];

async function fetchStudents() {
  try {
    const response = await fetch('http://localhost:3000/api/data?range=Sheet1');
    const result = await response.json();

    if (result.data && result.data.length > 0) {
      // Assume first row is headers, skip it
      // Mapping: 0: Name, 1: Class, 2: Periods, 3: Semester
      // Adjust indices based on actual sheet columns which presumably match the hardcoded data structure
      const rows = result.data.slice(1);

      students = rows.map(row => ({
        name: row[0],
        class: row[1],
        periods: row[2],
        semester: row[3],
        status: "Pending"
      }));

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

  students.forEach(student => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.class}</td>
      <td>${student.periods}</td>
      <td>${student.semester}</td>
      <td class="${student.status === "Approved" ? "approved" : "pending"}">
        ${student.status}
      </td>
    `;

    tableBody.appendChild(row);
  });
}

window.approveAll = async function () {
  messageEl.innerText = "Approving...";

  for (const student of students) {
    if (student.status !== "Approved") {
      try {
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
          console.log(`Signed for ${student.name}:`, resData);
        } else {
          console.error(`Failed to sign for ${student.name}`);
        }
      } catch (err) {
        console.error(`Error signing for ${student.name}:`, err);
      }
    }
  }

  loadTable();
  messageEl.innerText = "All students processed.";
};

// Initial load
fetchStudents();

const tableBody = document.getElementById("tableBody");
const messageEl = document.getElementById("message");

// ✅ Student data (acts like Google Sheet)
const students = [
  { name: "Arjun", class: "ECE", periods: "3", semester: "Sem 1", status: "Pending" },
  { name: "Meera", class: "ECE", periods: "5", semester: "Sem 2", status: "Pending" },
  { name: "Rahul", class: "ECE", periods: "2", semester: "Sem 1", status: "Pending" }
];

// Load table
function loadTable() {
  tableBody.innerHTML = "";

  students.forEach(student => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.class}</td>
      <td>${student.period}</td>
      <td>${student.semester}</td>
      <td class="${student.status === "Approved" ? "approved" : "pending"}">
        ${student.status}
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// ✅ APPROVE ALL FUNCTION
window.approveAll = function () {
  students.forEach(student => {
    student.status = "Approved";
  });

  loadTable();
  messageEl.innerText = "✅ All students approved successfully";
};

// Initial load
loadTable();

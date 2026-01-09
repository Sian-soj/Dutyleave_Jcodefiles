const tableBody = document.getElementById("tableBody");
const messageEl = document.getElementById("message");

// ✅ LOCAL DATA (acts like Google Sheet)
const students = [
  {
    name: "Arjun",
    class: "ece",
    period: "3",
    semester: "Sem 1",
    status: "Pending"
  },
  {
    name: "Meera",
    class: "ece",
    period: "5",
    semester: "Sem 2",
    status: "Pending"
  },
  {
    name: "sura",
    class: "ece",
    period: "5",
    semester: "Sem 2",
    status: "Pending"
  },
  {
    name: "sura",
    class: "ece",
    period: "5",
    semester: "Sem 2",
    status: "Pending"
  },
  {
    name: "sura",
    class: "ece",
    period: "5",
    semester: "Sem 2",
    status: "Pending"
  }
];

// Load table
function loadTable() {
  tableBody.innerHTML = "";

  students.forEach((student, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.class}</td>
      <td>${student.period}</td>
      <td>${student.semester}</td>
      <td class="${student.status === "Approved" ? "approved" : "pending"}">
        ${student.status}
      </td>
      <td>
        <button 
          ${student.status === "Approved" ? "disabled" : ""}
          onclick="approveStudent(${index})">
          Approve
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Approve logic
window.approveStudent = function (index) {
  students[index].status = "Approved";
  messageEl.innerText = `✅ ${students[index].name} approved`;
  loadTable();
};

// Initial load
loadTable();

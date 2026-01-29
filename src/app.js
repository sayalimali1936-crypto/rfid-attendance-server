const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STUDENTS_FILE = path.join(__dirname, "students.csv");
const ATTENDANCE_FILE = path.join(__dirname, "Attendance.csv");

/* ---- student lookup based on your CSV ---- */
function getStudentByCard(cardNo) {
  const data = fs.readFileSync(STUDENTS_FILE, "utf8");
  const lines = data.trim().split("\n");

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    const roll_no = cols[0].trim();
    const student_name = cols[1].trim();
    const batch = cols[2].trim();
    const card_no = cols[3].trim();

    if (card_no === cardNo.trim()) {
      return {
        student_name,
        class_name: batch,
        roll_no
      };
    }
  }
  return null;
}

/* ---- sanity check ---- */
app.get("/", (req, res) => {
  res.send("Server is running");
});

/* ---- MAIN attendance route ---- */
app.post("/mark-attendance", (req, res) => {
  const { card_no, subject_code } = req.body;
 if (!card_no) {
    return res.status(400).json({ error: "card_no missing" });
  }
if (!subject_code) {
  return res.status(400).json({ error: "subject_code missing" });
}


  const student = getStudentByCard(card_no);
  if (!student) {
    return res.status(404).json({ error: "student not found" });
  }

  const timestamp = new Date()
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  const row = `${card_no},${student.student_name},${student.class_name},${subject_code},${timestamp}\n`;


  fs.appendFileSync(ATTENDANCE_FILE, row);

  res.json({
    status: "success",
subject: subject_code,

    card_no,
    student_name: student.student_name,
    class: student.class_name,
    timestamp
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

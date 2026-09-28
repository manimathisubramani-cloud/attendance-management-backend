 require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const Student = require('./Student')
 
const app = express()

app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/attendanceDB')
  .then(() => {
    console.log('MongoDB Connected Successfully')
  })
  .catch((error) => {
    console.log('MongoDB Connection Error:', error)
  })


// ===============================
// ADD STUDENT
// ===============================

app.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body)

    const savedStudent = await student.save()

    res.json(savedStudent)

  } catch (error) {
    res.status(500).json({
      message: 'Error adding student',
      error: error.message
    })
  }
})


// ===============================
// GET ALL STUDENTS
// ===============================

app.get('/students', async (req, res) => {
  try {
    const students = await Student.find()

    res.json(students)

  } catch (error) {
    res.status(500).json({
      message: 'Error fetching students',
      error: error.message
    })
  }
})


// ===============================
// UPDATE STUDENT
// ===============================

app.put('/students/:id', async (req, res) => {
  try {
    const updatedStudent =
      await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      )

    res.json(updatedStudent)

  } catch (error) {
    res.status(500).json({
      message: 'Error updating student',
      error: error.message
    })
  }
})


// ===============================
// DELETE STUDENT
// ===============================

app.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id)

    res.json({
      message: 'Student deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      message: 'Error deleting student',
      error: error.message
    })
  }
})


// ===============================
// MARK DAILY ATTENDANCE
// ===============================

app.post('/students/:id/attendance', async (req, res) => {
  try {
    const { date, status } = req.body

    if (!date || !status) {
      return res.status(400).json({
        message: 'Date and status are required'
      })
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid attendance status'
      })
    }

    const student = await Student.findById(req.params.id)

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      })
    }

    // Prevent duplicate attendance for same date
    const alreadyMarked = student.attendanceRecords.some(
      (record) => record.date === date
    )

    if (alreadyMarked) {
      return res.status(400).json({
        message: 'Attendance already marked for this date'
      })
    }

    // Add attendance record
    student.attendanceRecords.push({
      date,
      status
    })

    // Update totals
    student.totalClasses += 1

    if (status === 'Present') {
      student.present += 1
    } else {
      student.absent += 1
    }

    await student.save()

    res.json(student)

  } catch (error) {
    res.status(500).json({
      message: 'Error marking attendance',
      error: error.message
    })
  }
})


// ===============================
// TEST BACKEND
// ===============================

app.get('/', (req, res) => {
  res.send('Attendance Backend is Running!')
})


// ===============================
// START SERVER
// ===============================

 const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

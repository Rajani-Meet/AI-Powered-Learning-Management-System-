import PDFDocument from 'pdfkit'
import * as XLSX from 'xlsx'

export function generateStudentReportPDF(studentData: any) {
  const doc = new PDFDocument()
  
  // Header
  doc.fontSize(20).text('Student Progress Report', 50, 50)
  doc.fontSize(14).text(`Student: ${studentData.name}`, 50, 80)
  doc.text(`Email: ${studentData.email}`, 50, 100)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 120)
  
  // Course Progress
  let yPos = 160
  doc.fontSize(16).text('Course Progress', 50, yPos)
  yPos += 30
  
  studentData.enrollments?.forEach((enrollment: any) => {
    doc.fontSize(12)
    doc.text(`Course: ${enrollment.course.title}`, 50, yPos)
    doc.text(`Instructor: ${enrollment.course.instructor.name}`, 50, yPos + 15)
    doc.text(`Enrolled: ${new Date(enrollment.enrolledAt).toLocaleDateString()}`, 50, yPos + 30)
    yPos += 60
  })
  
  // Assignment Scores
  if (studentData.submissions?.length > 0) {
    doc.fontSize(16).text('Assignment Scores', 50, yPos)
    yPos += 30
    
    studentData.submissions.forEach((submission: any) => {
      doc.fontSize(12)
      doc.text(`${submission.assignment.title}: ${submission.score || 'Pending'}/${submission.assignment.maxScore}`, 50, yPos)
      yPos += 20
    })
  }
  
  return doc
}

export function generateCourseReportExcel(courseData: any) {
  const workbook = XLSX.utils.book_new()
  
  // Course Overview Sheet
  const courseOverview = [
    ['Course Title', courseData.title],
    ['Instructor', courseData.instructor.name],
    ['Total Students', courseData.members?.length || 0],
    ['Total Lectures', courseData.lectures?.length || 0],
    ['Total Assignments', courseData.assignments?.length || 0],
    ['Total Quizzes', courseData.quizzes?.length || 0]
  ]
  
  const overviewSheet = XLSX.utils.aoa_to_sheet(courseOverview)
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview')
  
  // Students Sheet
  if (courseData.members?.length > 0) {
    const studentsData = courseData.members.map((member: any) => ({
      'Student Name': member.user.name,
      'Email': member.user.email,
      'Enrolled Date': new Date(member.enrolledAt).toLocaleDateString(),
      'Role': member.user.role
    }))
    
    const studentsSheet = XLSX.utils.json_to_sheet(studentsData)
    XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Students')
  }
  
  // Assignments Sheet
  if (courseData.assignments?.length > 0) {
    const assignmentsData = courseData.assignments.map((assignment: any) => ({
      'Assignment': assignment.title,
      'Due Date': assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline',
      'Max Score': assignment.maxScore,
      'Submissions': assignment.submissions?.length || 0
    }))
    
    const assignmentsSheet = XLSX.utils.json_to_sheet(assignmentsData)
    XLSX.utils.book_append_sheet(workbook, assignmentsSheet, 'Assignments')
  }
  
  return workbook
}
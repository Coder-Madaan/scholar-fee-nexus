
import * as XLSX from 'xlsx'
import { Student, Payment } from './supabase'

export const exportToExcel = {
  studentList: (students: Student[], filename: string = 'student_list.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(
      students.map(student => ({
        'Roll Number': student.roll_number,
        'Name': student.name,
        'Class': student.class,
        'Email': student.email,
        'Phone': student.phone,
        'Parent Name': student.parent_name,
        'Parent Phone': student.parent_phone,
        'Address': student.address,
        'Date of Birth': new Date(student.date_of_birth).toLocaleDateString()
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
    XLSX.writeFile(workbook, filename)
  },

  feeCollection: (payments: any[], filename: string = 'fee_collection_report.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(
      payments.map(payment => ({
        'Receipt Number': payment.receipt_number,
        'Student Name': payment.students?.name || 'N/A',
        'Class': payment.students?.class || 'N/A',
        'Roll Number': payment.students?.roll_number || 'N/A',
        'Fee Component': payment.fee_components?.name || 'N/A',
        'Amount': payment.amount,
        'Payment Method': payment.payment_method,
        'Payment Date': new Date(payment.payment_date).toLocaleDateString(),
        'Academic Year': payment.academic_year
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Collection')
    XLSX.writeFile(workbook, filename)
  },

  classwiseReport: (data: any[], filename: string = 'classwise_collection.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => ({
        'Class': item.class,
        'Total Collection': item.collection,
        'Students Count': item.students || 0
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Classwise Collection')
    XLSX.writeFile(workbook, filename)
  },

  componentwiseReport: (data: any[], filename: string = 'componentwise_collection.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => ({
        'Fee Component': item.name,
        'Total Collection': item.amount,
        'Percentage': `${((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%`
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Componentwise Collection')
    XLSX.writeFile(workbook, filename)
  }
}

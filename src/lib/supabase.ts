
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Student {
  id: number
  name: string
  email: string
  phone: string
  class: string
  roll_number: string
  parent_name: string
  parent_phone: string
  address: string
  created_at: string
}

export interface FeeComponent {
  id: number
  name: string
  class: string
  amount: number
  description: string
  created_at: string
}

export interface Payment {
  id: number
  student_id: number
  fee_component_id: number
  amount: number
  payment_method: 'cash' | 'cheque' | 'upi' | 'bank_transfer'
  payment_date: string
  academic_year: string
  receipt_number: string
  created_at: string
}

// Student operations
export const studentOperations = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(student: Omit<Student, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, student: Partial<Student>) {
    const { data, error } = await supabase
      .from('students')
      .update(student)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Fee component operations
export const feeComponentOperations = {
  async getAll() {
    const { data, error } = await supabase
      .from('fee_components')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(component: Omit<FeeComponent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('fee_components')
      .insert([component])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, component: Partial<FeeComponent>) {
    const { data, error } = await supabase
      .from('fee_components')
      .update(component)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('fee_components')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Payment operations
export const paymentOperations = {
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        students(name, class, roll_number),
        fee_components(name, amount)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(payment: Omit<Payment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByStudent(studentId: number) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        fee_components(name, amount)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Analytics operations
export const analyticsOperations = {
  async getClasswiseCollection(period: string = 'month') {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        amount,
        students(class)
      `)
    
    if (error) throw error
    
    const classwise = data.reduce((acc: any, payment: any) => {
      const className = payment.students.class
      if (!acc[className]) {
        acc[className] = 0
      }
      acc[className] += payment.amount
      return acc
    }, {})
    
    return Object.entries(classwise).map(([className, amount]) => ({
      class: className,
      collection: amount
    }))
  },

  async getFeeComponentCollection() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        amount,
        fee_components(name)
      `)
    
    if (error) throw error
    
    const componentwise = data.reduce((acc: any, payment: any) => {
      const componentName = payment.fee_components.name
      if (!acc[componentName]) {
        acc[componentName] = 0
      }
      acc[componentName] += payment.amount
      return acc
    }, {})
    
    return Object.entries(componentwise).map(([name, amount]) => ({
      name,
      value: amount,
      amount
    }))
  },

  async getMonthlyTrend() {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_date')
    
    if (error) throw error
    
    const monthly = data.reduce((acc: any, payment: any) => {
      const month = new Date(payment.payment_date).toLocaleString('default', { month: 'short' })
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += payment.amount
      return acc
    }, {})
    
    return Object.entries(monthly).map(([month, collection]) => ({
      month,
      collection,
      target: 500000
    }))
  }
}

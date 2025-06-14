
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Organization {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
  created_at: string
}

export interface UserOrganization {
  id: number
  user_id: string
  organization_id: number
  role: 'admin' | 'staff'
  created_at: string
}

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
  date_of_birth: string
  organization_id: number
  created_at: string
}

export interface FeeComponent {
  id: number
  name: string
  class: string
  amount: number
  description: string
  organization_id: number
  created_at: string
}

export interface Payment {
  id: number
  student_id: number
  fee_component_id: number | null
  amount: number
  payment_method: 'cash' | 'cheque' | 'upi' | 'bank_transfer'
  payment_date: string
  academic_year: string
  receipt_number: string
  transaction_ref?: string | null
  organization_id: number
  created_at: string
}

// Get user's organization
export const getUserOrganization = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from('user_organizations')
    .select('organization_id, organizations(*)')
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    console.error('Error getting user organization:', error);
    throw error;
  }
  return data
}

// Student operations
export const studentOperations = {
  async getAll() {
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(student: Omit<Student, 'id' | 'created_at' | 'organization_id'>) {
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('students')
      .insert([{ ...student, organization_id: userOrg.organization_id }])
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
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('fee_components')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(component: Omit<FeeComponent, 'id' | 'created_at' | 'organization_id'>) {
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('fee_components')
      .insert([{ ...component, organization_id: userOrg.organization_id }])
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
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        students(name, class, roll_number),
        fee_components(name, amount)
      `)
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(payment: Omit<Payment, 'id' | 'created_at' | 'organization_id'>) {
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('payments')
      .insert([{ ...payment, organization_id: userOrg.organization_id }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: number, payment: Partial<Payment>) {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getByStudent(studentId: number) {
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        fee_components(name, amount)
      `)
      .eq('student_id', studentId)
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Analytics operations
export const analyticsOperations = {
  async getClasswiseCollection(period: string = 'month') {
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('payments')
      .select(`
        amount,
        students(class)
      `)
      .eq('organization_id', userOrg.organization_id)
    
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
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('payments')
      .select(`
        amount,
        fee_components(name)
      `)
      .eq('organization_id', userOrg.organization_id)
    
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
    const userOrg = await getUserOrganization()
    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('organization_id', userOrg.organization_id)
    
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

// Organization operations
export const organizationOperations = {
  async create(name: string, userEmail: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('Creating organization:', name, 'for user:', userEmail);

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name, email: userEmail }])
      .select()
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError);
      throw orgError;
    }

    console.log('Organization created:', org);

    // Link user to organization
    const { error: linkError } = await supabase
      .from('user_organizations')
      .insert([{
        user_id: user.id,
        organization_id: org.id,
        role: 'admin'
      }])

    if (linkError) {
      console.error('Error linking user to organization:', linkError);
      throw linkError;
    }

    console.log('User linked to organization successfully');
    return org
  },

  async getUserOrganization() {
    return getUserOrganization()
  }
}

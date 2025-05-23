
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Download, Receipt, Edit, Trash } from 'lucide-react';
import { studentOperations, feeComponentOperations, paymentOperations, Student, FeeComponent } from '@/lib/supabase';
import { exportToExcel } from '@/lib/excelExport';
import { useToast } from '@/hooks/use-toast';

const PaymentTracking = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    student_id: '',
    fee_component_id: '',
    amount: '',
    payment_method: 'cash' as 'cash' | 'cheque' | 'upi' | 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    academic_year: '2024-25',
    receipt_number: ''
  });

  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
    `${currentYear - 1}-${currentYear.toString().slice(-2)}`,
    `${currentYear - 2}-${(currentYear - 1).toString().slice(-2)}`,
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, studentsData, componentsData] = await Promise.all([
        paymentOperations.getAll(),
        studentOperations.getAll(),
        feeComponentOperations.getAll()
      ]);
      
      setPayments(paymentsData || []);
      setStudents(studentsData || []);
      setFeeComponents(componentsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    return `REC${timestamp}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      fee_component_id: '',
      amount: '',
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      academic_year: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
      receipt_number: ''
    });
  };

  const handleAddPayment = async () => {
    try {
      const receiptNumber = generateReceiptNumber();
      await paymentOperations.create({
        ...formData,
        student_id: parseInt(formData.student_id),
        fee_component_id: parseInt(formData.fee_component_id),
        amount: parseInt(formData.amount),
        receipt_number: receiptNumber
      });
      
      await loadData();
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: `Payment recorded successfully. Receipt: ${receiptNumber}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    }
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setFormData({
      student_id: payment.student_id.toString(),
      fee_component_id: payment.fee_component_id.toString(),
      amount: payment.amount.toString(),
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      academic_year: payment.academic_year,
      receipt_number: payment.receipt_number
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    
    try {
      await paymentOperations.update(editingPayment.id, {
        ...formData,
        student_id: parseInt(formData.student_id),
        fee_component_id: parseInt(formData.fee_component_id),
        amount: parseInt(formData.amount)
      });
      
      await loadData();
      resetForm();
      setIsEditDialogOpen(false);
      setEditingPayment(null);
      toast({
        title: "Success",
        description: "Payment updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive"
      });
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await paymentOperations.delete(id);
      await loadData();
      toast({
        title: "Success",
        description: "Payment deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive"
      });
    }
  };

  const handleExportPayments = () => {
    exportToExcel.feeCollection(payments, 'fee_collection_report.xlsx');
    toast({
      title: "Success",
      description: "Payment report exported successfully"
    });
  };

  const getStudentFeeComponents = () => {
    if (!formData.student_id) return [];
    const student = students.find(s => s.id === parseInt(formData.student_id));
    if (!student) return [];
    return feeComponents.filter(fc => fc.class === student.class);
  };

  const selectedComponent = feeComponents.find(fc => fc.id === parseInt(formData.fee_component_id));

  const PaymentForm = ({ onSubmit, submitText }: { onSubmit: () => void, submitText: string }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student">Student</Label>
        <Select value={formData.student_id} onValueChange={(value) => {
          handleInputChange('student_id', value);
          handleInputChange('fee_component_id', '');
        }}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {students.map(student => (
              <SelectItem key={student.id} value={student.id.toString()} className="text-white">
                {student.name} ({student.class} - {student.roll_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feeComponent">Fee Component</Label>
        <Select value={formData.fee_component_id} onValueChange={(value) => {
          handleInputChange('fee_component_id', value);
          const component = feeComponents.find(fc => fc.id === parseInt(value));
          if (component) {
            handleInputChange('amount', component.amount.toString());
          }
        }}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select Fee Component" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {getStudentFeeComponents().map(component => (
              <SelectItem key={component.id} value={component.id.toString()} className="text-white">
                {component.name} - ₹{component.amount}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          placeholder="Enter amount"
          className="bg-gray-700 border-gray-600 text-white"
        />
        {selectedComponent && (
          <p className="text-sm text-gray-400">
            Component fee: ₹{selectedComponent.amount}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select value={formData.payment_method} onValueChange={(value: any) => handleInputChange('payment_method', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            <SelectItem value="cash" className="text-white">Cash</SelectItem>
            <SelectItem value="cheque" className="text-white">Cheque</SelectItem>
            <SelectItem value="upi" className="text-white">UPI</SelectItem>
            <SelectItem value="bank_transfer" className="text-white">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Input
          id="paymentDate"
          type="date"
          value={formData.payment_date}
          onChange={(e) => handleInputChange('payment_date', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="academicYear">Academic Year</Label>
        <Select value={formData.academic_year} onValueChange={(value) => handleInputChange('academic_year', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {academicYears.map(year => (
              <SelectItem key={year} value={year} className="text-white">{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={() => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }} className="border-gray-600 text-gray-300">
          Cancel
        </Button>
        <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
          {submitText}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading payment data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Payment Tracking</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handleExportPayments} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Record New Payment</DialogTitle>
                  </DialogHeader>
                  <PaymentForm onSubmit={handleAddPayment} submitText="Record Payment" />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Receipt No.</TableHead>
                  <TableHead className="text-gray-300">Student</TableHead>
                  <TableHead className="text-gray-300">Class</TableHead>
                  <TableHead className="text-gray-300">Fee Component</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Method</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Year</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-gray-700">
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 mr-2 text-green-400" />
                        {payment.receipt_number}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{payment.students?.name || 'N/A'}</TableCell>
                    <TableCell className="text-white">{payment.students?.class || 'N/A'}</TableCell>
                    <TableCell className="text-white">{payment.fee_components?.name || 'N/A'}</TableCell>
                    <TableCell className="text-white">₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-white capitalize">{payment.payment_method}</TableCell>
                    <TableCell className="text-white">{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-white">{payment.academic_year}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-600 text-gray-300"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-400"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm onSubmit={handleUpdatePayment} submitText="Update Payment" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTracking;

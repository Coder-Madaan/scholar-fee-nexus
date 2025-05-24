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

  const [searchTerm, setSearchTerm] = useState(""); // For searching students
  const [selectAllComponents, setSelectAllComponents] = useState(false); // Select all fee components

  // FIX: Always have all fields in formData object
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    student_id: "",
    fee_component_id: "",
    amount: "",
    payment_method: "cash" as "cash" | "cheque" | "upi" | "bank_transfer",
    payment_date: new Date().toISOString().split("T")[0],
    academic_year: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
    receipt_number: "",
    transaction_ref: "",
  });

  const academicYears = [
    `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
    `${currentYear - 1}-${currentYear.toString().slice(-2)}`,
    `${currentYear - 2}-${(currentYear - 1).toString().slice(-2)}`,
  ];

  // Responsive detection (vanilla JS, avoid react-responsive)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // --- SEARCH: Filtered student list by search term ---
  const filteredStudents = searchTerm
    ? students.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : students;

  // --- NEW: Get all fee components for selected student ---
  const studentClass =
    students.find((s) => s.id === parseInt(formData.student_id))?.class || "";

  const studentComponents = feeComponents.filter(
    (fc) => fc.class === studentClass
  );

  // --- NEW: When Select All is checked ---
  useEffect(() => {
    if (selectAllComponents) {
      setFormData((prev) => ({
        ...prev,
        fee_component_id: studentComponents.map((fc) => fc.id).join(","),
        amount: studentComponents.reduce((sum, fc) => sum + fc.amount, 0).toString(),
        // transaction_ref must always exist
        transaction_ref: prev.transaction_ref ?? "",
      }));
    }
    // eslint-disable-next-line
  }, [selectAllComponents, formData.student_id, JSON.stringify(studentComponents)]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Always include transaction_ref, avoid undefined in formData
      ...(field !== "transaction_ref" && { transaction_ref: prev.transaction_ref ?? "" })
    }));
    // Reset select-all when student is changed
    if (field === "student_id") {
      setSelectAllComponents(false);
    }
  };

  // Fix input freezing: All form fields derive value from formData now.

  const resetForm = () => {
    setFormData({
      student_id: "",
      fee_component_id: "",
      amount: "",
      payment_method: "cash",
      payment_date: new Date().toISOString().split("T")[0],
      academic_year: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
      receipt_number: "",
      transaction_ref: "",
    });
    setSearchTerm("");
    setSelectAllComponents(false);
  };

  // --- Updated Payment creation for SelectAll ---
  const handleAddPayment = async () => {
    try {
      const receiptNumber = generateReceiptNumber();
      let componentIds: string[] = [];
      if (formData.fee_component_id && formData.fee_component_id.includes(",")) {
        componentIds = formData.fee_component_id.split(",");
      } else {
        componentIds = [formData.fee_component_id];
      }
      await Promise.all(
        componentIds.map((componentId) =>
          paymentOperations.create({
            ...formData,
            student_id: parseInt(formData.student_id),
            fee_component_id: componentId ? parseInt(componentId) : null,
            amount: Math.round(parseInt(formData.amount) / (componentIds.length || 1)),
            receipt_number: receiptNumber,
            transaction_ref:
              formData.payment_method !== "cash" ? formData.transaction_ref : "",
          })
        )
      );
      await loadData();
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: `Payment recorded successfully. Receipt: ${receiptNumber}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setFormData({
      student_id: payment.student_id?.toString() ?? "",
      fee_component_id: payment.fee_component_id?.toString() ?? "",
      amount: payment.amount?.toString() ?? "",
      payment_method: payment.payment_method || "cash",
      payment_date: payment.payment_date || new Date().toISOString().split("T")[0],
      academic_year: payment.academic_year || `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
      receipt_number: payment.receipt_number || "",
      transaction_ref: payment.transaction_ref || "",
    });
    setIsEditDialogOpen(true);
  };

  // --- Updated Payment update for SelectAll/TransactionRef ---
  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    
    try {
      await paymentOperations.update(editingPayment.id, {
        ...formData,
        student_id: parseInt(formData.student_id),
        fee_component_id: formData.fee_component_id
          ? parseInt(formData.fee_component_id)
          : null,
        amount: parseInt(formData.amount),
        transaction_ref:
          formData.payment_method !== "cash" ? formData.transaction_ref : "",
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

  const PaymentForm = ({ onSubmit, submitText }: { onSubmit: () => void, submitText: string }) => (
    <div className={`space-y-4 ${isMobile ? "p-2" : ""}`}>
      {/* Student Search & Select */}
      <div className="space-y-2">
        <Label htmlFor="student">Student</Label>
        <Input
          id="searchStudent"
          placeholder="Search student name or roll no."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
        <Select value={formData.student_id} onValueChange={(value) => handleInputChange("student_id", value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {filteredStudents.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()} className="text-white">
                {student.name} ({student.class} - {student.roll_number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fee Component (Select All Option) */}
      <div className={`${isMobile ? "flex flex-col gap-1" : "space-y-2"} relative`}>
        <Label htmlFor="feeComponent">Fee Component</Label>
        <div className="flex items-center space-x-2 mb-1 flex-wrap">
          <input
            type="checkbox"
            id="selectAllComponents"
            checked={selectAllComponents}
            onChange={(e) => setSelectAllComponents(e.target.checked)}
            className="accent-blue-600"
          />
          <Label htmlFor="selectAllComponents" className="text-sm text-blue-300 font-normal cursor-pointer">
            Select All Fee Components for this class
          </Label>
        </div>
        <Select
          value={formData.fee_component_id}
          onValueChange={(value) => {
            setSelectAllComponents(false);
            handleInputChange("fee_component_id", value);
            const component = feeComponents.find((fc) => fc.id === parseInt(value));
            if (component) {
              handleInputChange("amount", component.amount.toString());
            }
          }}
          disabled={selectAllComponents}
        >
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select Fee Component" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {studentComponents.map((component) => (
              <SelectItem key={component.id} value={component.id.toString()} className="text-white">
                {component.name} - ₹{component.amount}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => handleInputChange("amount", e.target.value)}
          placeholder="Enter amount"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select value={formData.payment_method} onValueChange={(value: any) => handleInputChange("payment_method", value)}>
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

      {/* Transaction/Cheque Number for non-cash */}
      {(formData.payment_method === "upi" ||
        formData.payment_method === "bank_transfer" ||
        formData.payment_method === "cheque") && (
        <div className="space-y-2">
          <Label htmlFor="transactionNo">
            {formData.payment_method === "cheque" ? "Cheque No." : "Transaction/UTR No."}
          </Label>
          <Input
            id="transactionNo"
            type="text"
            value={formData.transaction_ref}
            onChange={(e) => handleInputChange("transaction_ref", e.target.value)}
            placeholder={
              formData.payment_method === "cheque" ? "Enter cheque number" : "Enter transaction/UTR number"
            }
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      )}

      {/* Payment Date */}
      <div className="space-y-2">
        <Label htmlFor="paymentDate">Payment Date</Label>
        <Input
          id="paymentDate"
          type="date"
          value={formData.payment_date}
          onChange={(e) => handleInputChange("payment_date", e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      {/* Academic Year as input */}
      <div className="space-y-2">
        <Label htmlFor="academicYear">Academic Year</Label>
        <Input
          id="academicYear"
          type="text"
          value={formData.academic_year}
          onChange={(e) => handleInputChange("academic_year", e.target.value)}
          placeholder="e.g. 2024-25"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }}
          className="border-gray-600 text-gray-300"
        >
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

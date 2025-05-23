
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Receipt } from 'lucide-react';

const PaymentTracking = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      rollNumber: 'STU001',
      class: 'Class 10',
      feeComponent: 'Tuition Fee',
      amount: 15000,
      paymentMode: 'UPI',
      transactionId: 'TXN123456789',
      paymentDate: '2024-01-15',
      status: 'Completed'
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      rollNumber: 'STU002',
      class: 'Class 9',
      feeComponent: 'Transport Fee',
      amount: 2000,
      paymentMode: 'Cash',
      transactionId: 'CASH001',
      paymentDate: '2024-01-14',
      status: 'Completed'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    class: '',
    feeComponent: '',
    amount: '',
    paymentMode: '',
    transactionId: '',
    paymentDate: ''
  });

  const students = ['John Doe (STU001)', 'Jane Smith (STU002)', 'Bob Johnson (STU003)'];
  const feeComponents = ['Tuition Fee', 'Transport Fee', 'Lab Fee', 'Library Fee', 'Sports Fee'];
  const paymentModes = ['UPI', 'Cash', 'Cheque', 'Net Banking', 'Card'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPayment = () => {
    const newPayment = {
      id: payments.length + 1,
      ...formData,
      amount: parseInt(formData.amount),
      status: 'Completed'
    };
    setPayments(prev => [...prev, newPayment]);
    setFormData({
      studentName: '',
      rollNumber: '',
      class: '',
      feeComponent: '',
      amount: '',
      paymentMode: '',
      transactionId: '',
      paymentDate: ''
    });
    setIsAddDialogOpen(false);
  };

  const filteredPayments = payments.filter(payment =>
    payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.feeComponent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      'Completed': 'bg-green-600',
      'Pending': 'bg-yellow-600',
      'Failed': 'bg-red-600'
    };
    return (
      <Badge className={`${variants[status as keyof typeof variants]} text-white`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Payment Tracking</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-xl">
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student</Label>
                      <Select value={formData.studentName} onValueChange={(value) => handleInputChange('studentName', value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select Student" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {students.map(student => (
                            <SelectItem key={student} value={student} className="text-white">{student}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feeComponent">Fee Component</Label>
                      <Select value={formData.feeComponent} onValueChange={(value) => handleInputChange('feeComponent', value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select Fee Component" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {feeComponents.map(component => (
                            <SelectItem key={component} value={component} className="text-white">{component}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMode">Payment Mode</Label>
                      <Select value={formData.paymentMode} onValueChange={(value) => handleInputChange('paymentMode', value)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select Payment Mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {paymentModes.map(mode => (
                            <SelectItem key={mode} value={mode} className="text-white">{mode}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID</Label>
                      <Input
                        id="transactionId"
                        value={formData.transactionId}
                        onChange={(e) => handleInputChange('transactionId', e.target.value)}
                        placeholder="Transaction/Reference ID"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Payment Date</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button onClick={handleAddPayment} className="bg-blue-600 hover:bg-blue-700">
                    Record Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Student</TableHead>
                  <TableHead className="text-gray-300">Fee Component</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Payment Mode</TableHead>
                  <TableHead className="text-gray-300">Transaction ID</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-gray-700">
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-sm text-gray-400">{payment.rollNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{payment.feeComponent}</TableCell>
                    <TableCell className="text-white">₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-white">{payment.paymentMode}</TableCell>
                    <TableCell className="text-white">{payment.transactionId}</TableCell>
                    <TableCell className="text-white">{payment.paymentDate}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Receipt className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracking;

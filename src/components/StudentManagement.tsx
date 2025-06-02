import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash, Download } from 'lucide-react';
import { studentOperations, Student } from '@/lib/supabase';
import { exportToExcel } from '@/lib/excelExport';
import { useToast } from '@/hooks/use-toast';

// Extracted StudentForm component
const StudentForm = React.memo(({ 
  formData, 
  classes, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  submitText 
}: { 
  formData: any;
  classes: string[];
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitText: string;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Student Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter student name"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rollNumber">Roll Number</Label>
        <Input
          id="rollNumber"
          value={formData.roll_number}
          onChange={(e) => onInputChange('roll_number', e.target.value)}
          placeholder="Enter roll number"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          placeholder="Enter email"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          placeholder="Enter phone number"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="class">Class</Label>
        <Select value={formData.class} onValueChange={(value) => onInputChange('class', value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {classes.map(cls => (
              <SelectItem key={cls} value={cls} className="text-white">{cls}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => onInputChange('date_of_birth', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="parentName">Parent Name</Label>
        <Input
          id="parentName"
          value={formData.parent_name}
          onChange={(e) => onInputChange('parent_name', e.target.value)}
          placeholder="Enter parent name"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="parentPhone">Parent Phone</Label>
        <Input
          id="parentPhone"
          value={formData.parent_phone}
          onChange={(e) => onInputChange('parent_phone', e.target.value)}
          placeholder="Enter parent phone"
          className="bg-gray-700 border-gray-600 text-white"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="address">Address</Label>
      <Input
        id="address"
        value={formData.address}
        onChange={(e) => onInputChange('address', e.target.value)}
        placeholder="Enter address"
        className="bg-gray-700 border-gray-600 text-white"
      />
    </div>

    <div className="flex justify-end space-x-2 mt-6">
      <Button variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300">
        Cancel
      </Button>
      <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
        {submitText}
      </Button>
    </div>
  </div>
));

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    roll_number: '',
    parent_name: '',
    parent_phone: '',
    address: '',
    date_of_birth: ''
  });

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentOperations.getAll();
      setStudents(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      class: '',
      roll_number: '',
      parent_name: '',
      parent_phone: '',
      address: '',
      date_of_birth: ''
    });
  }, []);

  const handleAddStudent = async () => {
    try {
      await studentOperations.create(formData);
      await loadStudents();
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Student added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive"
      });
    }
  };

  const handleEditStudent = useCallback((student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      class: student.class,
      roll_number: student.roll_number,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      address: student.address,
      date_of_birth: student.date_of_birth
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    
    try {
      await studentOperations.update(editingStudent.id, formData);
      await loadStudents();
      resetForm();
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      toast({
        title: "Success",
        description: "Student updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await studentOperations.delete(id);
      await loadStudents();
      toast({
        title: "Success",
        description: "Student deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive"
      });
    }
  };

  const handleExportStudents = () => {
    exportToExcel.studentList(students, 'student_list.xlsx');
    toast({
      title: "Success",
      description: "Student list exported successfully"
    });
  };

  const handleCancel = useCallback(() => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    resetForm();
  }, [resetForm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Student Management</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handleExportStudents} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <StudentForm 
                    formData={formData}
                    classes={classes}
                    onInputChange={handleInputChange}
                    onSubmit={handleAddStudent}
                    onCancel={handleCancel}
                    submitText="Add Student"
                  />
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
                  <TableHead className="text-gray-300">Roll No.</TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Class</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Phone</TableHead>
                  <TableHead className="text-gray-300">Parent</TableHead>
                  <TableHead className="text-gray-300">DOB</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className="border-gray-700">
                    <TableCell className="text-white font-medium">{student.roll_number}</TableCell>
                    <TableCell className="text-white">{student.name}</TableCell>
                    <TableCell className="text-white">{student.class}</TableCell>
                    <TableCell className="text-white">{student.email}</TableCell>
                    <TableCell className="text-white">{student.phone}</TableCell>
                    <TableCell className="text-white">{student.parent_name}</TableCell>
                    <TableCell className="text-white">{new Date(student.date_of_birth).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-600 text-gray-300"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-400"
                          onClick={() => handleDeleteStudent(student.id)}
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
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <StudentForm 
            formData={formData}
            classes={classes}
            onInputChange={handleInputChange}
            onSubmit={handleUpdateStudent}
            onCancel={handleCancel}
            submitText="Update Student"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
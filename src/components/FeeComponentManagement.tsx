
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash } from 'lucide-react';
import { feeComponentOperations, FeeComponent } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Extracted ComponentForm
const ComponentForm = React.memo(({ 
  formData, 
  selectedClass,
  onInputChange, 
  onSubmit, 
  onCancel, 
  submitText 
}: { 
  formData: any;
  selectedClass: string;
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitText: string;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="componentName">Component Name</Label>
      <Input
        id="componentName"
        value={formData.name}
        onChange={(e) => onInputChange('name', e.target.value)}
        placeholder="e.g., Tuition Fee, Transport Fee"
        className="bg-gray-700 border-gray-600 text-white"
      />
    </div>
    <div className="space-y-2">
      <Label>Class</Label>
      <Input
        value={selectedClass}
        readOnly
        className="bg-gray-600 border-gray-500 text-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="amount">Amount (₹)</Label>
      <Input
        id="amount"
        type="number"
        value={formData.amount}
        onChange={(e) => onInputChange('amount', e.target.value)}
        placeholder="Enter amount"
        className="bg-gray-700 border-gray-600 text-white"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        value={formData.description}
        onChange={(e) => onInputChange('description', e.target.value)}
        placeholder="Brief description"
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

const FeeComponentManagement = () => {
  const [feeComponents, setFeeComponents] = useState<FeeComponent[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<FeeComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: ''
  });

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  useEffect(() => {
    loadFeeComponents();
  }, []);

  const loadFeeComponents = async () => {
    try {
      setLoading(true);
      const data = await feeComponentOperations.getAll();
      setFeeComponents(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load fee components",
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
    setFormData({ name: '', amount: '', description: '' });
  }, []);

  const checkNameUniqueness = (name: string, classValue: string, excludeId?: number) => {
    return !feeComponents.some(component => 
      component.name.toLowerCase() === name.toLowerCase() && 
      component.class === classValue &&
      component.id !== excludeId
    );
  };

  const handleAddFeeComponent = async () => {
    if (!selectedClass) return;

    if (!checkNameUniqueness(formData.name, selectedClass)) {
      toast({
        title: "Error",
        description: `A fee component with name "${formData.name}" already exists for ${selectedClass}`,
        variant: "destructive"
      });
      return;
    }

    try {
      await feeComponentOperations.create({
        ...formData,
        class: selectedClass,
        amount: parseInt(formData.amount)
      });
      await loadFeeComponents();
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Fee component added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add fee component",
        variant: "destructive"
      });
    }
  };

  const handleEditComponent = useCallback((component: FeeComponent) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      amount: component.amount.toString(),
      description: component.description
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateComponent = async () => {
    if (!editingComponent) return;
    
    if (!checkNameUniqueness(formData.name, editingComponent.class, editingComponent.id)) {
      toast({
        title: "Error",
        description: `A fee component with name "${formData.name}" already exists for ${editingComponent.class}`,
        variant: "destructive"
      });
      return;
    }

    try {
      await feeComponentOperations.update(editingComponent.id, {
        ...formData,
        amount: parseInt(formData.amount)
      });
      await loadFeeComponents();
      resetForm();
      setIsEditDialogOpen(false);
      setEditingComponent(null);
      toast({
        title: "Success",
        description: "Fee component updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fee component",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fee component?')) return;
    
    try {
      await feeComponentOperations.delete(id);
      await loadFeeComponents();
      toast({
        title: "Success",
        description: "Fee component deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete fee component",
        variant: "destructive"
      });
    }
  };

  const handleCancel = useCallback(() => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const filteredComponents = selectedClass 
    ? feeComponents.filter(component => component.class === selectedClass)
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading fee components...</div>
      </div>
    );
  }

  // Class selection view
  if (!selectedClass) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Fee Component Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 mb-4">Select a class to manage fee components:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {classes.map((cls) => (
                <Button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  {cls}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Class-specific component management view
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Fee Components for {selectedClass}</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setSelectedClass(null)}
                className="border-gray-600 text-gray-300 mt-2"
              >
                ← Back to Classes
              </Button>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fee Component
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Fee Component for {selectedClass}</DialogTitle>
                </DialogHeader>
                <ComponentForm 
                  formData={formData}
                  selectedClass={selectedClass}
                  onInputChange={handleInputChange}
                  onSubmit={handleAddFeeComponent}
                  onCancel={handleCancel}
                  submitText="Add Component"
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Component Name</TableHead>
                  <TableHead className="text-gray-300">Amount (₹)</TableHead>
                  <TableHead className="text-gray-300">Description</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComponents.length === 0 ? (
                  <TableRow className="border-gray-700">
                    <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                      No fee components found for {selectedClass}. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComponents.map((component) => (
                    <TableRow key={component.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{component.name}</TableCell>
                      <TableCell className="text-white">₹{component.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-white">{component.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300"
                            onClick={() => handleEditComponent(component)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-400"
                            onClick={() => handleDelete(component.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Fee Component</DialogTitle>
          </DialogHeader>
          <ComponentForm 
            formData={formData}
            selectedClass={editingComponent?.class || ''}
            onInputChange={handleInputChange}
            onSubmit={handleUpdateComponent}
            onCancel={handleCancel}
            submitText="Update Component"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeComponentManagement;

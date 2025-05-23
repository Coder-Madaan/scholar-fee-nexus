
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { analyticsOperations, paymentOperations, studentOperations } from '@/lib/supabase';
import { exportToExcel } from '@/lib/excelExport';
import { useToast } from '@/hooks/use-toast';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');
  const [classWiseData, setClassWiseData] = useState<any[]>([]);
  const [feeComponentData, setFeeComponentData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalCollection: 0,
    collectionRate: 0,
    paidStudents: 0,
    totalStudents: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedClass]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [classwise, componentwise, monthly, payments, students] = await Promise.all([
        analyticsOperations.getClasswiseCollection(selectedPeriod),
        analyticsOperations.getFeeComponentCollection(),
        analyticsOperations.getMonthlyTrend(),
        paymentOperations.getAll(),
        studentOperations.getAll()
      ]);

      setClassWiseData(classwise);
      setFeeComponentData(componentwise);
      setMonthlyTrend(monthly);

      // Calculate summary
      const totalCollection = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const uniqueStudentsPaid = new Set(payments.map((p: any) => p.student_id)).size;
      const totalStudents = students.length;
      const collectionRate = totalStudents > 0 ? (uniqueStudentsPaid / totalStudents) * 100 : 0;

      setSummary({
        totalCollection,
        collectionRate,
        paidStudents: uniqueStudentsPaid,
        totalStudents,
        pendingAmount: (totalStudents - uniqueStudentsPaid) * 15000 // Assuming avg fee
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: string) => {
    try {
      switch (type) {
        case 'Student List':
          const students = await studentOperations.getAll();
          exportToExcel.studentList(students, 'student_list.xlsx');
          break;
        case 'Fee Collection':
          const payments = await paymentOperations.getAll();
          exportToExcel.feeCollection(payments, 'fee_collection_report.xlsx');
          break;
        case 'Classwise Report':
          exportToExcel.classwiseReport(classWiseData, 'classwise_collection.xlsx');
          break;
        case 'Componentwise Report':
          exportToExcel.componentwiseReport(feeComponentData, 'componentwise_collection.xlsx');
          break;
      }
      toast({
        title: "Success",
        description: `${type} exported successfully!`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Reports & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <label className="text-gray-300 text-sm">Period:</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="month" className="text-white">This Month</SelectItem>
                  <SelectItem value="quarter" className="text-white">This Quarter</SelectItem>
                  <SelectItem value="year" className="text-white">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-gray-300 text-sm">Class:</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white">All Classes</SelectItem>
                  <SelectItem value="1-5" className="text-white">Class 1-5</SelectItem>
                  <SelectItem value="6-10" className="text-white">Class 6-10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button 
                onClick={() => exportData('Student List')} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Student List
              </Button>
              <Button 
                onClick={() => exportData('Fee Collection')} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Fee Collection
              </Button>
              <Button 
                onClick={() => exportData('Classwise Report')} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Classwise
              </Button>
              <Button 
                onClick={() => exportData('Componentwise Report')} 
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Componentwise
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Total Collection</p>
                <p className="text-2xl font-bold text-white">₹{summary.totalCollection.toLocaleString()}</p>
                <p className="text-green-400 text-sm">Real-time data</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Collection Rate</p>
                <p className="text-2xl font-bold text-white">{summary.collectionRate.toFixed(1)}%</p>
                <p className="text-yellow-400 text-sm">Target: 95%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Paid Students</p>
                <p className="text-2xl font-bold text-white">{summary.paidStudents}</p>
                <p className="text-green-400 text-sm">Out of {summary.totalStudents} total</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-400 text-sm">Pending Amount</p>
                <p className="text-2xl font-bold text-white">₹{summary.pendingAmount.toLocaleString()}</p>
                <p className="text-red-400 text-sm">{summary.totalStudents - summary.paidStudents} students</p>
              </div>
              <Calendar className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class-wise Collection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Class-wise Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classWiseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="class" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: 'white' }}
                />
                <Bar dataKey="collection" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fee Component Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Fee Component Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeComponentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {feeComponentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Monthly Collection Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: 'white' }}
              />
              <Line type="monotone" dataKey="collection" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;

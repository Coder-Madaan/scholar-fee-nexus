
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');

  // Sample data for charts
  const classWiseData = [
    { class: 'Class 1', collection: 45000, students: 30 },
    { class: 'Class 2', collection: 48000, students: 32 },
    { class: 'Class 3', collection: 52000, students: 35 },
    { class: 'Class 4', collection: 55000, students: 37 },
    { class: 'Class 5', collection: 58000, students: 38 },
    { class: 'Class 6', collection: 62000, students: 40 },
    { class: 'Class 7', collection: 65000, students: 42 },
    { class: 'Class 8', collection: 68000, students: 44 },
    { class: 'Class 9', collection: 72000, students: 45 },
    { class: 'Class 10', collection: 75000, students: 48 }
  ];

  const feeComponentData = [
    { name: 'Tuition Fee', value: 65, amount: 325000 },
    { name: 'Transport Fee', value: 20, amount: 100000 },
    { name: 'Lab Fee', value: 8, amount: 40000 },
    { name: 'Library Fee', value: 4, amount: 20000 },
    { name: 'Sports Fee', value: 3, amount: 15000 }
  ];

  const monthlyTrend = [
    { month: 'Jan', collection: 450000, target: 500000 },
    { month: 'Feb', collection: 480000, target: 500000 },
    { month: 'Mar', collection: 520000, target: 500000 },
    { month: 'Apr', collection: 495000, target: 500000 },
    { month: 'May', collection: 510000, target: 500000 },
    { month: 'Jun', collection: 535000, target: 500000 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const exportData = (type: string) => {
    // In a real application, this would generate and download actual Excel files
    console.log(`Exporting ${type} data...`);
    alert(`${type} report will be downloaded shortly!`);
  };

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
            <div className="ml-auto flex space-x-2">
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
                <p className="text-2xl font-bold text-white">₹5,00,000</p>
                <p className="text-green-400 text-sm">+8% from last period</p>
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
                <p className="text-2xl font-bold text-white">92%</p>
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
                <p className="text-2xl font-bold text-white">380</p>
                <p className="text-green-400 text-sm">Out of 410 total</p>
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
                <p className="text-2xl font-bold text-white">₹45,000</p>
                <p className="text-red-400 text-sm">30 students</p>
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

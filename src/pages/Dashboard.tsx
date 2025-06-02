import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, FileText, Download, Plus, LogOut } from 'lucide-react';
import StudentManagement from '@/components/StudentManagement';
import FeeComponentManagement from '@/components/FeeComponentManagement';
import PaymentTracking from '@/components/PaymentTracking';
import ReportsAnalytics from '@/components/ReportsAnalytics';
import { studentOperations, paymentOperations, supabase } from '@/lib/supabase';
import { exportToExcel } from '@/lib/excelExport';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalCollection: 0,
    pendingPayments: 0,
    thisMonthCollection: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [students, payments] = await Promise.all([
        studentOperations.getAll(),
        paymentOperations.getAll()
      ]);

      const totalStudents = students.length;
      const totalCollection = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculate this month's collection
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      const thisMonthCollection = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);

      // Calculate pending payments (students who haven't paid)
      const paidStudentIds = new Set(payments.map(p => p.student_id));
      const pendingPayments = totalStudents - paidStudentIds.size;

      setDashboardStats({
        totalStudents,
        totalCollection,
        pendingPayments,
        thisMonthCollection
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // The auth state change will be handled by App.tsx
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  };

  const handleExportAllData = async () => {
    try {
      const [students, payments] = await Promise.all([
        studentOperations.getAll(),
        paymentOperations.getAll()
      ]);
      
      // Export both student list and payment data
      exportToExcel.studentList(students, 'complete_student_data.xlsx');
      exportToExcel.feeCollection(payments, 'complete_payment_data.xlsx');
      
      toast({
        title: "Success",
        description: "Complete data exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">School Fee Management System</h1>
            <p className="text-gray-400">Manage student fees, payments, and generate reports</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExportAllData} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : dashboardStats.totalStudents.toLocaleString()}
              </div>
              <p className="text-xs text-green-400">Active students</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Collection</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : `₹${dashboardStats.totalCollection.toLocaleString()}`}
              </div>
              <p className="text-xs text-green-400">All time collection</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pending Payments</CardTitle>
              <FileText className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : dashboardStats.pendingPayments}
              </div>
              <p className="text-xs text-yellow-400">Students pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : `₹${dashboardStats.thisMonthCollection.toLocaleString()}`}
              </div>
              <p className="text-xs text-purple-400">Current month collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="students" className="data-[state=active]:bg-gray-700">
              Students
            </TabsTrigger>
            <TabsTrigger value="fee-components" className="data-[state=active]:bg-gray-700">
              Fee Components
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-gray-700">
              Payments
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gray-700">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="fee-components" className="space-y-6">
            <FeeComponentManagement />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentTracking />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

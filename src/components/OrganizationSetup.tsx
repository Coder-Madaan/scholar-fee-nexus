
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface OrganizationSetupProps {
  userEmail: string;
  onSetupComplete: (name: string, userEmail: string) => Promise<void>;
}

const OrganizationSetup = ({ userEmail, onSetupComplete }: OrganizationSetupProps) => {
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) return;

    setLoading(true);
    try {
      await onSetupComplete(schoolName.trim(), userEmail);
      toast({
        title: "Success",
        description: "School setup completed successfully!"
      });
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Error",
        description: "Failed to setup school. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">Welcome!</CardTitle>
          <p className="text-gray-400">Let's set up your school</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-gray-300">School Name</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter your school name"
                className="bg-gray-700 border-gray-600 text-white"
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !schoolName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSetup;

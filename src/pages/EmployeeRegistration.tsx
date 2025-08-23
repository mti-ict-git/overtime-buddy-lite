import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeRegistration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    name: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employee_id.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Check if employee already exists
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', formData.employee_id)
        .maybeSingle();

      if (existingEmployee) {
        toast({
          title: "Error",
          description: "Employee ID already exists",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Insert new employee
      const { error } = await supabase
        .from('employees')
        .insert({
          employee_id: formData.employee_id,
          name: formData.name
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to register employee",
          variant: "destructive",
        });
        console.error('Error:', error);
        return;
      }

      toast({
        title: "Success",
        description: "Employee registered successfully",
      });

      // Reset form
      setFormData({
        employee_id: "",
        name: ""
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark p-3 rounded-lg">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Registration</h1>
          <p className="text-muted-foreground">Register new employees for overtime tracking</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Employee Registration</CardTitle>
          <CardDescription>
            Enter employee details to register them in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID *</Label>
                <Input
                  id="employee_id"
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  placeholder="Enter employee ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ employee_id: "", name: "" })}
                disabled={loading}
              >
                Clear
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Employee
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
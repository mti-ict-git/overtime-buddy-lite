import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Loader2, Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { employeeSchema } from "@/lib/validation";

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email?: string;
  section?: string;
  created_at: string;
}

export default function EmployeeRegistration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    employee_id: "",
    name: ""
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      // Error already handled
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({ employee_id: "", name: "" });
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate with zod
    try {
      employeeSchema.parse(formData);
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      if (editingEmployee) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update({
            employee_id: formData.employee_id,
            name: formData.name
          })
          .eq('id', editingEmployee.id);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update employee. You must be admin.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        // Check if employee ID already exists (only for new employees)
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
            description: "Failed to register employee. You must be authenticated.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Employee registered successfully",
        });
      }

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
      fetchEmployees(); // Refresh the list

    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete employee. You must be admin.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      fetchEmployees(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark p-3 rounded-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employee Management</h1>
            <p className="text-muted-foreground">Manage employees for overtime tracking</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee ? "Update employee details" : "Enter employee details to register them in the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID * (3-20 chars, alphanumeric)</Label>
                <Input
                  id="employee_id"
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  placeholder="e.g., EMP001"
                  required
                  className={validationErrors.employee_id ? 'border-destructive' : ''}
                />
                {validationErrors.employee_id && (
                  <p className="text-sm text-destructive">{validationErrors.employee_id}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name * (2-100 chars)</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                  maxLength={100}
                  className={validationErrors.name ? 'border-destructive' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive">{validationErrors.name}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingEmployee ? "Update Employee" : "Add Employee"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Employees</CardTitle>
          <CardDescription>
            View and manage all registered employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEmployees ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading employees...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees registered yet. Click "Add Employee" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.employee_id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email || "-"}</TableCell>
                    <TableCell>{employee.section || "-"}</TableCell>
                    <TableCell>{new Date(employee.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {employee.name} (ID: {employee.employee_id})? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(employee)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
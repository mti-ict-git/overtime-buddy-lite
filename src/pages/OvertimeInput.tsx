import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OvertimeEntry {
  employeeId: string;
  overtimeDate: string;
  calculationBasedOnTime: string;
  planOvertimeHour: number;
  dateIn: string;
  fromTime: string;
  dateOut: string;
  toTime: string;
  breakFromTime: string;
  breakToTime: string;
  reason: string;
}

export default function OvertimeInput() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OvertimeEntry>({
    employeeId: "",
    overtimeDate: "",
    calculationBasedOnTime: "N",
    planOvertimeHour: 0,
    dateIn: "",
    fromTime: "",
    dateOut: "",
    toTime: "",
    breakFromTime: "",
    breakToTime: "",
    reason: "",
  });

  const handleInputChange = (field: keyof OvertimeEntry, value: string | number) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // If overtime date changes, automatically set date in to the same value
      if (field === 'overtimeDate' && typeof value === 'string') {
        updated.dateIn = value;
      }
      
      return updated;
    });
  };

  // Auto-calculate date out and to time when plan overtime hours, date in, or from time changes
  // Plan overtime hour is always 0, no calculation needed
  // useEffect(() => {
  //   if (formData.planOvertimeHour > 0 && formData.dateIn && formData.fromTime) {
  //     calculateEndDateTime();
  //   }
  // }, [formData.planOvertimeHour, formData.dateIn, formData.fromTime]);

  const calculateEndDateTime = () => {
    if (!formData.dateIn || !formData.fromTime || formData.planOvertimeHour <= 0) {
      return;
    }

    try {
      // Parse the date in (format: dd.MM.yyyy)
      const dateInParts = formData.dateIn.split('.');
      if (dateInParts.length !== 3) return;
      
      const startDate = new Date(
        parseInt(dateInParts[2]), // year
        parseInt(dateInParts[1]) - 1, // month (0-indexed)
        parseInt(dateInParts[0]) // day
      );

      // Parse the from time (format: HH:MM)
      const timeParts = formData.fromTime.split(':');
      if (timeParts.length !== 2) return;

      startDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);

      // Add the overtime hours
      const endDate = new Date(startDate.getTime() + (formData.planOvertimeHour * 60 * 60 * 1000));

      // Format the end date (dd.MM.yyyy)
      const endDateFormatted = `${endDate.getDate().toString().padStart(2, '0')}.${(endDate.getMonth() + 1).toString().padStart(2, '0')}.${endDate.getFullYear()}`;
      
      // Format the end time (HH:MM)
      const endTimeFormatted = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      setFormData(prev => ({
        ...prev,
        dateOut: endDateFormatted,
        toTime: endTimeFormatted
      }));
    } catch (error) {
      console.error('Error calculating end date/time:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.employeeId || !formData.overtimeDate || !formData.reason || 
        !formData.fromTime || !formData.dateOut || !formData.toTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including date out and to time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, check if employee exists, if not create them
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('employee_id', formData.employeeId)
        .single();

      if (!existingEmployee) {
        // Create employee record
        const { error: employeeError } = await supabase
          .from('employees')
          .insert({
            employee_id: formData.employeeId,
            name: `Employee ${formData.employeeId}`, // Default name, can be updated later
            section: 'IT Section' // Default section
          });

        if (employeeError) {
          console.error('Error creating employee:', employeeError);
          toast({
            title: "Error",
            description: "Failed to create employee record",
            variant: "destructive",
          });
          return;
        }
      }

      // Convert date format from dd.MM.yyyy to yyyy-MM-dd for database
      const convertDateForDB = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length !== 3) return null;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      };

      // Insert overtime record
      const { error: overtimeError } = await supabase
        .from('overtime_records')
        .insert({
          employee_id: formData.employeeId,
          overtime_date: convertDateForDB(formData.overtimeDate),
          calculation_based_on_time: formData.calculationBasedOnTime === 'Y',
          plan_overtime_hour: 0,
          date_in: convertDateForDB(formData.dateIn),
          from_time: formData.fromTime,
          date_out: convertDateForDB(formData.dateOut),
          to_time: formData.toTime,
          break_from_time: null,
          break_to_time: null,
          reason: formData.reason
        });

      if (overtimeError) {
        console.error('Error saving overtime record:', overtimeError);
        toast({
          title: "Error",
          description: "Failed to save overtime record to database",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Overtime entry has been saved to database successfully",
      });

      // Reset form
      setFormData({
        employeeId: "",
        overtimeDate: "",
        calculationBasedOnTime: "N",
        planOvertimeHour: 0,
        dateIn: "",
        fromTime: "",
        dateOut: "",
        toTime: "",
        breakFromTime: "",
        breakToTime: "",
        reason: "",
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const formatDateFromInput = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark p-3 rounded-lg">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Input Overtime</h1>
          <p className="text-muted-foreground">Record daily overtime entries for employees</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Overtime Entry Form</span>
          </CardTitle>
          <CardDescription>
            Fill in the overtime details for the employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange("employeeId", e.target.value)}
                  placeholder="e.g., MTI240264"
                  required
                />
              </div>

              {/* Overtime Date */}
              <div className="space-y-2">
                <Label htmlFor="overtimeDate">Overtime Date *</Label>
                <Input
                  id="overtimeDate"
                  type="date"
                  value={formatDateForInput(formData.overtimeDate)}
                  onChange={(e) => handleInputChange("overtimeDate", formatDateFromInput(e.target.value))}
                  required
                />
              </div>

              {/* Calculation Based On Time */}
              <div className="space-y-2">
                <Label htmlFor="calculationBasedOnTime">Calculation Based On Time</Label>
                <Select
                  value={formData.calculationBasedOnTime}
                  onValueChange={(value) => handleInputChange("calculationBasedOnTime", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y">Yes</SelectItem>
                    <SelectItem value="N">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plan Overtime Hour */}
              <div className="space-y-2">
                <Label htmlFor="planOvertimeHour">Plan Overtime Hours</Label>
                <Input
                  id="planOvertimeHour"
                  type="number"
                  value={formData.planOvertimeHour}
                  onChange={(e) => handleInputChange("planOvertimeHour", Number(e.target.value))}
                  min="0"
                  max="24"
                  step="0.5"
                />
                <p className="text-xs text-muted-foreground">
                  Saved as 0 in database for export purposes
                </p>
              </div>

              {/* Date In */}
              <div className="space-y-2">
                <Label htmlFor="dateIn">Date In (Auto-filled)</Label>
                <Input
                  id="dateIn"
                  type="date"
                  value={formatDateForInput(formData.dateIn)}
                  onChange={(e) => handleInputChange("dateIn", formatDateFromInput(e.target.value))}
                  className="bg-muted"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Automatically set to same as overtime date
                </p>
              </div>

              {/* From Time */}
              <div className="space-y-2">
                <Label htmlFor="fromTime">From Time *</Label>
                <Input
                  id="fromTime"
                  type="time"
                  value={formData.fromTime}
                  onChange={(e) => handleInputChange("fromTime", e.target.value)}
                  required
                />
              </div>

               {/* Date Out */}
               <div className="space-y-2">
                 <Label htmlFor="dateOut">Date Out *</Label>
                 <Input
                   id="dateOut"
                   type="date"
                   value={formatDateForInput(formData.dateOut)}
                   onChange={(e) => handleInputChange("dateOut", formatDateFromInput(e.target.value))}
                   required
                 />
               </div>

               {/* To Time */}
               <div className="space-y-2">
                 <Label htmlFor="toTime">To Time *</Label>
                 <Input
                   id="toTime"
                   type="time"
                   value={formData.toTime}
                   onChange={(e) => handleInputChange("toTime", e.target.value)}
                   required
                 />
               </div>

            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Describe the overtime work performed..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading ? "Saving..." : "Save Overtime Entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
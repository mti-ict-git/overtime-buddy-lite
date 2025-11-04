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
import { overtimeSchema } from "@/lib/validation";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
  useEffect(() => {
    if (formData.planOvertimeHour > 0 && formData.dateIn && formData.fromTime) {
      calculateEndDateTime();
    }
  }, [formData.planOvertimeHour, formData.dateIn, formData.fromTime]);

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
      // Error calculating dates - silently handle
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate with zod
    try {
      overtimeSchema.parse({
        employeeId: formData.employeeId,
        overtimeDate: formData.overtimeDate,
        planOvertimeHour: formData.planOvertimeHour,
        fromTime: formData.fromTime,
        reason: formData.reason
      });
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
      // Convert date format from dd.MM.yyyy to yyyy-MM-dd for database
      const convertDateForDB = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length !== 3) return null;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      };

      // Submit overtime using secure atomic function
      const { data, error } = await supabase.rpc('submit_overtime_entry', {
        p_employee_id: formData.employeeId,
        p_overtime_date: convertDateForDB(formData.overtimeDate),
        p_calculation_based_on_time: formData.calculationBasedOnTime === 'Y',
        p_plan_overtime_hour: formData.planOvertimeHour,
        p_date_in: convertDateForDB(formData.dateIn),
        p_from_time: formData.fromTime,
        p_date_out: convertDateForDB(formData.dateOut),
        p_to_time: formData.toTime,
        p_reason: formData.reason,
        p_break_from_time: null,
        p_break_to_time: null,
        p_name: profile?.display_name || user?.email || `Employee ${formData.employeeId}`,
        p_section: 'IT Section',
        p_email: profile?.email || user?.email || null
      });

      if (error) {
        console.error('Overtime submission error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to save overtime record. You must be authenticated.",
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
                  placeholder="e.g., MTI240264 (3-20 chars, alphanumeric)"
                  required
                  className={validationErrors.employeeId ? 'border-destructive' : ''}
                />
                {validationErrors.employeeId && (
                  <p className="text-sm text-destructive">{validationErrors.employeeId}</p>
                )}
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
                <Label htmlFor="planOvertimeHour">Plan Overtime Hours *</Label>
                <Input
                  id="planOvertimeHour"
                  type="number"
                  value={formData.planOvertimeHour}
                  onChange={(e) => handleInputChange("planOvertimeHour", Number(e.target.value))}
                  min="0.5"
                  max="24"
                  step="0.5"
                  className={validationErrors.planOvertimeHour ? 'border-destructive' : ''}
                />
                {validationErrors.planOvertimeHour && (
                  <p className="text-sm text-destructive">{validationErrors.planOvertimeHour}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Date out and to time will be calculated automatically. Exported as 0 in CSV files.
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
                 <Label htmlFor="dateOut">Date Out (Auto-calculated)</Label>
                 <Input
                   id="dateOut"
                   type="date"
                   value={formatDateForInput(formData.dateOut)}
                   onChange={(e) => handleInputChange("dateOut", formatDateFromInput(e.target.value))}
                   className="bg-muted"
                   readOnly
                 />
                 <p className="text-xs text-muted-foreground">
                   Calculated based on plan overtime hours
                 </p>
               </div>

               {/* To Time */}
               <div className="space-y-2">
                 <Label htmlFor="toTime">To Time (Auto-calculated)</Label>
                 <Input
                   id="toTime"
                   type="time"
                   value={formData.toTime}
                   onChange={(e) => handleInputChange("toTime", e.target.value)}
                   className="bg-muted"
                   readOnly
                 />
                 <p className="text-xs text-muted-foreground">
                   Calculated based on plan overtime hours
                 </p>
               </div>

            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason * (10-1000 characters)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Describe the overtime work performed (minimum 10 characters)..."
                rows={3}
                required
                maxLength={1000}
                className={validationErrors.reason ? 'border-destructive' : ''}
              />
              {validationErrors.reason && (
                <p className="text-sm text-destructive">{validationErrors.reason}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.reason.length}/1000 characters
              </p>
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
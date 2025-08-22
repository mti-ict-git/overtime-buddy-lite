import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Save } from "lucide-react";

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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.employeeId || !formData.overtimeDate || !formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Here you would save to your database
    console.log("Overtime entry:", formData);
    
    toast({
      title: "Success",
      description: "Overtime entry has been saved successfully",
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
                />
              </div>

              {/* Date In */}
              <div className="space-y-2">
                <Label htmlFor="dateIn">Date In</Label>
                <Input
                  id="dateIn"
                  type="date"
                  value={formatDateForInput(formData.dateIn)}
                  onChange={(e) => handleInputChange("dateIn", formatDateFromInput(e.target.value))}
                />
              </div>

              {/* From Time */}
              <div className="space-y-2">
                <Label htmlFor="fromTime">From Time</Label>
                <Input
                  id="fromTime"
                  type="time"
                  value={formData.fromTime}
                  onChange={(e) => handleInputChange("fromTime", e.target.value)}
                />
              </div>

              {/* Date Out */}
              <div className="space-y-2">
                <Label htmlFor="dateOut">Date Out</Label>
                <Input
                  id="dateOut"
                  type="date"
                  value={formatDateForInput(formData.dateOut)}
                  onChange={(e) => handleInputChange("dateOut", formatDateFromInput(e.target.value))}
                />
              </div>

              {/* To Time */}
              <div className="space-y-2">
                <Label htmlFor="toTime">To Time</Label>
                <Input
                  id="toTime"
                  type="time"
                  value={formData.toTime}
                  onChange={(e) => handleInputChange("toTime", e.target.value)}
                />
              </div>

              {/* Break From Time */}
              <div className="space-y-2">
                <Label htmlFor="breakFromTime">Break From Time</Label>
                <Input
                  id="breakFromTime"
                  type="time"
                  value={formData.breakFromTime}
                  onChange={(e) => handleInputChange("breakFromTime", e.target.value)}
                />
              </div>

              {/* Break To Time */}
              <div className="space-y-2">
                <Label htmlFor="breakToTime">Break To Time</Label>
                <Input
                  id="breakToTime"
                  type="time"
                  value={formData.breakToTime}
                  onChange={(e) => handleInputChange("breakToTime", e.target.value)}
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
              <Button type="submit" className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark">
                <Save className="h-4 w-4 mr-2" />
                Save Overtime Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
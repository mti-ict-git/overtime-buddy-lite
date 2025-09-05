import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OvertimeRecord {
  id: string;
  employee_id: string;
  overtime_date: string;
  calculation_based_on_time: boolean;
  plan_overtime_hour: number;
  date_in: string;
  from_time: string;
  date_out: string;
  to_time: string;
  break_from_time: string | null;
  break_to_time: string | null;
  reason: string;
}

interface EditOvertimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: OvertimeRecord | null;
  onSuccess: () => void;
}

export default function EditOvertimeDialog({ open, onOpenChange, record, onSuccess }: EditOvertimeDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<OvertimeRecord>>({});

  useEffect(() => {
    if (record) {
      setFormData({
        employee_id: record.employee_id,
        overtime_date: record.overtime_date,
        calculation_based_on_time: record.calculation_based_on_time,
        plan_overtime_hour: record.plan_overtime_hour,
        date_in: record.date_in,
        from_time: record.from_time,
        date_out: record.date_out,
        to_time: record.to_time,
        break_from_time: record.break_from_time,
        break_to_time: record.break_to_time,
        reason: record.reason
      });
    }
  }, [record]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!record) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('overtime_records')
        .update(formData)
        .eq('id', record.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update overtime record",
          variant: "destructive",
        });
        console.error('Error:', error);
        return;
      }

      toast({
        title: "Success",
        description: "Overtime record updated successfully",
      });

      onSuccess();
      onOpenChange(false);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Overtime Record</DialogTitle>
          <DialogDescription>
            Make changes to the overtime record. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={formData.employee_id || ""}
                onChange={(e) => handleInputChange('employee_id', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtime_date">Overtime Date</Label>
              <Input
                id="overtime_date"
                type="date"
                value={formData.overtime_date || ""}
                onChange={(e) => handleInputChange('overtime_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_overtime_hour">Plan Overtime Hours</Label>
              <Input
                id="plan_overtime_hour"
                type="number"
                value={formData.plan_overtime_hour || ""}
                onChange={(e) => handleInputChange('plan_overtime_hour', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calculation_based_on_time">Calculation Method</Label>
              <select
                id="calculation_based_on_time"
                value={formData.calculation_based_on_time ? "true" : "false"}
                onChange={(e) => handleInputChange('calculation_based_on_time', e.target.value === "true")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="false">Fixed Hours</option>
                <option value="true">Time-based</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_in">Date In</Label>
              <Input
                id="date_in"
                type="date"
                value={formData.date_in || ""}
                onChange={(e) => handleInputChange('date_in', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_time">From Time</Label>
              <Input
                id="from_time"
                type="time"
                value={formData.from_time || ""}
                onChange={(e) => handleInputChange('from_time', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_out">Date Out</Label>
              <Input
                id="date_out"
                type="date"
                value={formData.date_out || ""}
                onChange={(e) => handleInputChange('date_out', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_time">To Time</Label>
              <Input
                id="to_time"
                type="time"
                value={formData.to_time || ""}
                onChange={(e) => handleInputChange('to_time', e.target.value)}
                required
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason || ""}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Enter reason for overtime"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
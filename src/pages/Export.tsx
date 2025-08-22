import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Download, Send, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

export default function Export() {
  const { toast } = useToast();
  const [overtimeData, setOvertimeData] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    toEmail: "",
    subject: "",
    message: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchOvertimeData();
  }, []);

  const fetchOvertimeData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('overtime_records')
        .select('*')
        .order('overtime_date', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch overtime data",
          variant: "destructive",
        });
        console.error('Error fetching overtime data:', error);
        return;
      }

      setOvertimeData(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEmailData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB').replace(/\//g, '.');
  };

  const filterDataByDateRange = (data: OvertimeRecord[]) => {
    if (!emailData.startDate && !emailData.endDate) {
      return data;
    }

    return data.filter((item) => {
      const itemDate = new Date(item.overtime_date);
      let matchesDateRange = true;

      if (emailData.startDate) {
        const start = new Date(emailData.startDate);
        matchesDateRange = matchesDateRange && itemDate >= start;
      }
      if (emailData.endDate) {
        const end = new Date(emailData.endDate);
        matchesDateRange = matchesDateRange && itemDate <= end;
      }

      return matchesDateRange;
    });
  };

  const generateCSV = () => {
    const filteredData = filterDataByDateRange(overtimeData);
    
    if (filteredData.length === 0) {
      toast({
        title: "No Data",
        description: "No overtime records found for the selected date range",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "EmployeeID",
      "OvertimeDate(dd.MM.yyyy)",
      "CalculationBasedOnTime",
      "PlanOvertimeHour",
      "DateIn(dd.MM.yyyy)",
      "FromTime",
      "DateOut(dd.MM.yyyy)",
      "ToTime",
      "BreakFromTime",
      "BreakToTime",
      "Reason"
    ];

    const csvData = filteredData.map(item => [
      item.employee_id,
      formatDate(item.overtime_date),
      item.calculation_based_on_time ? "Y" : "N",
      item.plan_overtime_hour.toString(),
      formatDate(item.date_in),
      item.from_time,
      formatDate(item.date_out),
      item.to_time,
      item.break_from_time || "",
      item.break_to_time || "",
      item.reason
    ]);

    const csvContent = [
      headers.join(";"),
      ...csvData.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    const dateRange = emailData.startDate && emailData.endDate 
      ? `_${emailData.startDate}_to_${emailData.endDate}`
      : `_${new Date().toISOString().split('T')[0]}`;
    
    link.setAttribute("download", `overtime_report${dateRange}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `CSV file downloaded with ${filteredData.length} records`,
    });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.toEmail || !emailData.subject) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required email fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email Integration Required",
      description: "This feature requires MS Graph API integration. Please connect to Supabase for backend functionality.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark p-3 rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Export & Email</h1>
          <p className="text-muted-foreground">Export overtime data and send via email</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>CSV Export</span>
            </CardTitle>
            <CardDescription>
              Download overtime data in CSV format matching your original structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exportStartDate">Start Date</Label>
                  <Input
                    id="exportStartDate"
                    type="date"
                    value={emailData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exportEndDate">End Date</Label>
                  <Input
                    id="exportEndDate"
                    type="date"
                    value={emailData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Preview:</h4>
                <code className="text-xs text-muted-foreground block">
                  EmployeeID;OvertimeDate(dd.MM.yyyy);CalculationBasedOnTime;PlanOvertimeHour;DateIn(dd.MM.yyyy);FromTime;DateOut(dd.MM.yyyy);ToTime;BreakFromTime;BreakToTime;Reason
                </code>
              </div>

              <Button 
                onClick={generateCSV} 
                className="w-full bg-gradient-to-r from-corporate-blue to-corporate-blue-dark"
                disabled={loading || overtimeData.length === 0}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download CSV Report ({filterDataByDateRange(overtimeData).length} records)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email Report</span>
            </CardTitle>
            <CardDescription>
              Send overtime reports via email using MS Graph integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toEmail">To Email *</Label>
                <Input
                  id="toEmail"
                  type="email"
                  value={emailData.toEmail}
                  onChange={(e) => handleInputChange("toEmail", e.target.value)}
                  placeholder="recipient@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Overtime Report - [Date Range]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={emailData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Please find attached the overtime report for the requested period..."
                  rows={4}
                />
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">MS Graph Integration Required</p>
                    <p className="text-muted-foreground mt-1">
                      To send emails, you need to connect to Supabase for backend functionality including MS Graph API integration.
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Email Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Instructions</CardTitle>
          <CardDescription>
            Setup required for full functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">For Email Functionality:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Connect your project to Supabase using the green button in the top right</li>
                <li>• Set up MS Graph API credentials for email sending</li>
                <li>• Configure authentication for the logged-in user's email account</li>
                <li>• Add email templates and attachment handling</li>
              </ul>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">For Data Persistence:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create database tables for overtime entries</li>
                <li>• Set up user authentication and role-based access</li>
                <li>• Configure data validation and business rules</li>
                <li>• Add audit trails and data backup functionality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
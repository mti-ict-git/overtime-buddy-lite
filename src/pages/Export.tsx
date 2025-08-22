import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Download, Send, FileText } from "lucide-react";

export default function Export() {
  const { toast } = useToast();
  const [emailData, setEmailData] = useState({
    toEmail: "",
    subject: "",
    message: "",
    startDate: "",
    endDate: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setEmailData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateCSV = () => {
    // Sample CSV generation based on your format
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

    // Sample data - in a real app, this would come from your database
    const sampleData = [
      ["MTI240264", "19.08.2025", "N", "3", "19.08.2025", "15:00", "19.08.2025", "18:00", "", "", "Pemotongan sisa kabel proyek di pyrite server"],
      ["MTI240264", "20.08.2025", "N", "2", "20.08.2025", "15:00", "20.08.2025", "17:00", "", "", "Preventive Maintenance Network Device Panel Pyrite Plant"],
      ["MTI240265", "19.08.2025", "N", "2", "19.08.2025", "15:00", "19.08.2025", "17:00", "", "", "Perbaikan CCTV di jembatan penyebrangan Acid Ke Choloride"]
    ];

    const csvContent = [
      headers.join(";"),
      ...sampleData.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `overtime_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "CSV file has been downloaded successfully",
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

              <Button onClick={generateCSV} className="w-full bg-gradient-to-r from-corporate-blue to-corporate-blue-dark">
                <Download className="h-4 w-4 mr-2" />
                Download CSV Report
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
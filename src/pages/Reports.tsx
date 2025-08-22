import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Search, Filter, Download } from "lucide-react";

// Sample data based on your CSV format
const sampleOvertimeData = [
  {
    employeeId: "MTI240264",
    overtimeDate: "19.08.2025",
    calculationBasedOnTime: "N",
    planOvertimeHour: 3,
    dateIn: "19.08.2025",
    fromTime: "15:00",
    dateOut: "19.08.2025",
    toTime: "18:00",
    breakFromTime: "",
    breakToTime: "",
    reason: "Pemotongan sisa kabel proyek di pyrite server"
  },
  {
    employeeId: "MTI240264",
    overtimeDate: "20.08.2025",
    calculationBasedOnTime: "N",
    planOvertimeHour: 2,
    dateIn: "20.08.2025",
    fromTime: "15:00",
    dateOut: "20.08.2025",
    toTime: "17:00",
    breakFromTime: "",
    breakToTime: "",
    reason: "Preventive Maintenance Network Device Panel Pyrite Plant"
  },
  {
    employeeId: "MTI240265",
    overtimeDate: "19.08.2025",
    calculationBasedOnTime: "N",
    planOvertimeHour: 2,
    dateIn: "19.08.2025",
    fromTime: "15:00",
    dateOut: "19.08.2025",
    toTime: "17:00",
    breakFromTime: "",
    breakToTime: "",
    reason: "Perbaikan CCTV di jembatan penyebrangan Acid Ke Choloride"
  },
  {
    employeeId: "MTI240266",
    overtimeDate: "19.08.2025",
    calculationBasedOnTime: "N",
    planOvertimeHour: 2,
    dateIn: "19.08.2025",
    fromTime: "15:00",
    dateOut: "19.08.2025",
    toTime: "17:00",
    breakFromTime: "",
    breakToTime: "",
    reason: "Setup PC for FAP Acid"
  },
  {
    employeeId: "MTI250130",
    overtimeDate: "21.08.2025",
    calculationBasedOnTime: "N",
    planOvertimeHour: 4,
    dateIn: "21.08.2025",
    fromTime: "15:00",
    dateOut: "21.08.2025",
    toTime: "17:00",
    breakFromTime: "",
    breakToTime: "",
    reason: "Perbaikan Siaran TV Di Area Gold Makarti"
  }
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredData = sampleOvertimeData.filter((item) => {
    const matchesSearch = 
      item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDateRange = true;
    if (startDate || endDate) {
      const itemDate = new Date(item.overtimeDate.split('.').reverse().join('-'));
      if (startDate) {
        const start = new Date(startDate);
        matchesDateRange = matchesDateRange && itemDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        matchesDateRange = matchesDateRange && itemDate <= end;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  const totalHours = filteredData.reduce((sum, item) => sum + item.planOvertimeHour, 0);
  const uniqueEmployees = new Set(filteredData.map(item => item.employeeId)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark p-3 rounded-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overtime Reports</h1>
          <p className="text-muted-foreground">View and analyze overtime data</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Overtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-blue">{totalHours}</div>
            <p className="text-xs text-muted-foreground">From filtered results</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-blue">{uniqueEmployees}</div>
            <p className="text-xs text-muted-foreground">With overtime records</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-corporate-blue">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground">Overtime entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          <CardDescription>Filter overtime records by date range and search terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Employee ID or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Overtime Records</CardTitle>
              <CardDescription>
                Showing {filteredData.length} of {sampleOvertimeData.length} records
              </CardDescription>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Time Range</TableHead>
                  <TableHead>Calculation</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No overtime records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.employeeId}</TableCell>
                      <TableCell>{item.overtimeDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.planOvertimeHour}h</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.fromTime} - {item.toTime}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.calculationBasedOnTime === "Y" ? "default" : "outline"}>
                          {item.calculationBasedOnTime === "Y" ? "Time-based" : "Fixed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={item.reason}>
                        {item.reason}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
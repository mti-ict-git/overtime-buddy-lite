import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Search, Filter, Download, Loader2 } from "lucide-react";
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
  employees?: {
    name: string;
    section: string;
  };
}

export default function Reports() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [overtimeData, setOvertimeData] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOvertimeData();
  }, []);

  const fetchOvertimeData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('overtime_records')
        .select(`
          *,
          employees (
            name,
            section
          )
        `)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB').replace(/\//g, '.');
  };

  const filteredData = overtimeData.filter((item) => {
    const matchesSearch = 
      item.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.employees?.name && item.employees.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDateRange = true;
    if (startDate || endDate) {
      const itemDate = new Date(item.overtime_date);
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

  const totalHours = filteredData.reduce((sum, item) => sum + item.plan_overtime_hour, 0);
  const uniqueEmployees = new Set(filteredData.map(item => item.employee_id)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark p-3 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Overtime Reports</h1>
            <p className="text-muted-foreground">View and analyze overtime data</p>
          </div>
        </div>
        <Button 
          onClick={fetchOvertimeData} 
          variant="outline" 
          disabled={loading}
          className="flex items-center space-x-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
          <span>Refresh</span>
        </Button>
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
                Showing {filteredData.length} of {overtimeData.length} records
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground">Loading overtime records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No overtime records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{item.employee_id}</div>
                          {item.employees?.name && (
                            <div className="text-xs text-muted-foreground">{item.employees.name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(item.overtime_date)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.plan_overtime_hour}h</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.from_time} - {item.to_time}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.calculation_based_on_time ? "default" : "outline"}>
                          {item.calculation_based_on_time ? "Time-based" : "Fixed"}
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
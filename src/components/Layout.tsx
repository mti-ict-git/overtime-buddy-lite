import { Link, useLocation } from "react-router-dom";
import { Clock, FileText, BarChart3, Mail, User, Settings, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Input Overtime", href: "/", icon: Clock, allowGuests: true },
  { name: "Employee Registration", href: "/employee-registration", icon: User, allowGuests: true },
  { name: "Reports", href: "/reports", icon: BarChart3, adminOnly: true },
  { name: "Export", href: "/export", icon: FileText, adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, profile, signOut, isAdmin, isUser } = useAuth();

  const filteredNavigation = navigation.filter(item => {
    // If user is not authenticated, only show items that allow guests
    if (!user) return item.allowGuests;
    
    // If user has 'user' role, only show Input Overtime
    if (isUser() && item.href !== '/') return false;
    
    // If user is authenticated but not admin, filter out admin-only items
    if (!isAdmin() && item.adminOnly) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark p-2 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Overtime Management System
                </h1>
                <p className="text-sm text-muted-foreground">
                  Employee overtime tracking and reporting
                </p>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {profile?.display_name || user.email}
                      </span>
                      {profile?.role && (
                        <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                          {profile.role}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{profile?.display_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin() && (
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={signOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-1" />}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
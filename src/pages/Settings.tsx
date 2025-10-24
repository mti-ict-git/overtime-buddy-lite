import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Loader2, Settings as SettingsIcon, Lock, Database, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { passwordSchema, msGraphSchema } from '@/lib/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminSettings {
  ms_graph_enabled: boolean;
  ms_graph_tenant_id: string;
  ms_graph_client_id: string;
}

const Settings = () => {
  const { user, profile, loading, isAdmin, updatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    ms_graph_enabled: false,
    ms_graph_tenant_id: '',
    ms_graph_client_id: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated or not admin
  if (!loading && (!user || !isAdmin())) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (user && isAdmin()) {
      fetchAdminSettings();
    }
  }, [user, profile]);

  const fetchAdminSettings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching admin settings:', error);
      return;
    }

    if (data) {
      setAdminSettings({
        ms_graph_enabled: data.ms_graph_enabled,
        ms_graph_tenant_id: data.ms_graph_tenant_id || '',
        ms_graph_client_id: data.ms_graph_client_id || ''
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate password
    try {
      passwordSchema.parse(passwordData);
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      toast.error('Please fix validation errors');
      return;
    }
    
    setIsLoading(true);
    const { error } = await updatePassword(passwordData.newPassword);
    
    if (!error) {
      setPasswordData({ newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    }
    
    setIsLoading(false);
  };

  const handleAdminSettingsChange = (field: keyof AdminSettings, value: string | boolean) => {
    setAdminSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveAdminSettings = async () => {
    if (!user) return;
    setValidationErrors({});
    
    // Only validate if MS Graph is enabled
    if (adminSettings.ms_graph_enabled) {
      try {
        msGraphSchema.parse({
          ms_graph_tenant_id: adminSettings.ms_graph_tenant_id,
          ms_graph_client_id: adminSettings.ms_graph_client_id
        });
      } catch (error: any) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
        setValidationErrors(errors);
        toast.error('Please fix validation errors');
        return;
      }
    }
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from('admin_settings')
      .upsert({
        user_id: user.id,
        ms_graph_enabled: adminSettings.ms_graph_enabled,
        ms_graph_tenant_id: adminSettings.ms_graph_tenant_id,
        ms_graph_client_id: adminSettings.ms_graph_client_id
      });

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Settings saved successfully');
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Admin Settings</h1>
      </div>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password" className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Password</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password for enhanced security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min 8 chars, uppercase, lowercase, number"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    required
                    className={validationErrors.newPassword ? 'border-destructive' : ''}
                  />
                  {validationErrors.newPassword && (
                    <p className="text-sm text-destructive">{validationErrors.newPassword}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    required
                    className={validationErrors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Microsoft Graph Integration</CardTitle>
              <CardDescription>
                Configure Microsoft Graph API settings for enhanced functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="ms-graph-enabled">Enable Microsoft Graph</Label>
                  <p className="text-sm text-muted-foreground">
                    Integrate with Microsoft services for calendar and user data
                  </p>
                </div>
                <Switch
                  id="ms-graph-enabled"
                  checked={adminSettings.ms_graph_enabled}
                  onCheckedChange={(checked) => handleAdminSettingsChange('ms_graph_enabled', checked)}
                />
              </div>

              {adminSettings.ms_graph_enabled && (
                <div className="space-y-4 border-t pt-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Client Secret must be configured via Supabase Secrets for security. Only Tenant ID and Client ID are stored in the database.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tenant-id">Tenant ID *</Label>
                    <Input
                      id="tenant-id"
                      type="text"
                      placeholder="Enter Microsoft Tenant ID"
                      value={adminSettings.ms_graph_tenant_id}
                      onChange={(e) => handleAdminSettingsChange('ms_graph_tenant_id', e.target.value)}
                      className={validationErrors.ms_graph_tenant_id ? 'border-destructive' : ''}
                    />
                    {validationErrors.ms_graph_tenant_id && (
                      <p className="text-sm text-destructive">{validationErrors.ms_graph_tenant_id}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-id">Client ID *</Label>
                    <Input
                      id="client-id"
                      type="text"
                      placeholder="Enter Application Client ID"
                      value={adminSettings.ms_graph_client_id}
                      onChange={(e) => handleAdminSettingsChange('ms_graph_client_id', e.target.value)}
                      className={validationErrors.ms_graph_client_id ? 'border-destructive' : ''}
                    />
                    {validationErrors.ms_graph_client_id && (
                      <p className="text-sm text-destructive">{validationErrors.ms_graph_client_id}</p>
                    )}
                  </div>
                </div>
              )}

              <Button 
                onClick={saveAdminSettings}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Integration Settings'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
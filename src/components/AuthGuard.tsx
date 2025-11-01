import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  allowGuests?: boolean;
}

const AuthGuard = ({ children, requireAdmin = false, allowGuests = false }: AuthGuardProps) => {
  const { user, profile, loading, isAdmin, isUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If guests are allowed, render the children regardless of auth status
  if (allowGuests) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If admin is required but user is not admin, redirect to home
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
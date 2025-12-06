import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Invite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store token and redirect to auth with owner parameter
      // The token IS the owner_user_id from the agency app
      localStorage.setItem('agency_owner_id', token);
      navigate(`/auth?owner=${token}`, { replace: true });
    } else {
      // No token, redirect to auth (will show invalid access)
      navigate('/auth', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <p className="text-primary-foreground">Redirecting...</p>
    </div>
  );
}

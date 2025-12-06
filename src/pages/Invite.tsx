import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function Invite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Invalid invite link. No token provided.');
        return;
      }

      console.log('Looking up token:', token);
      
      // Look up the token in agency_invite_tokens table to get the owner_user_id
      const { data, error: lookupError } = await supabase
        .from('agency_invite_tokens')
        .select('owner_user_id, is_active')
        .eq('token', token)
        .maybeSingle();

      console.log('Lookup result:', { data, error: lookupError });

      if (lookupError) {
        console.error('Token lookup error:', lookupError);
        setError(`Error validating invite link: ${lookupError.message}`);
        return;
      }

      if (!data) {
        setError('Invalid or expired invite link. Token not found in database.');
        return;
      }
      
      if (data.is_active === false) {
        setError('This invite link has been deactivated.');
        return;
      }

      // Store the actual owner UUID (not the token hash)
      localStorage.setItem('agency_owner_id', data.owner_user_id);
      navigate(`/auth?owner=${data.owner_user_id}`, { replace: true });
    };

    validateToken();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold text-destructive mb-2">Invalid Invite</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="flex items-center gap-2 text-primary-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <p>Validating invite link...</p>
      </div>
    </div>
  );
}

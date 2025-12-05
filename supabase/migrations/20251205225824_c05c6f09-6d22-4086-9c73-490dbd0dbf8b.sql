-- Create client_profile table with all AI Visibility schema fields
CREATE TABLE public.client_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Entity/Organization Info (Sheet 1)
  entity_name TEXT NOT NULL,
  legal_name TEXT,
  main_website_url TEXT,
  short_description TEXT,
  long_description TEXT,
  hours TEXT,
  founding_year INTEGER,
  team_size INTEGER,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_postal_code TEXT,
  phone TEXT,
  email TEXT,
  same_as JSONB DEFAULT '[]'::jsonb,
  
  -- Services (Sheet 2)
  services JSONB DEFAULT '[]'::jsonb,
  
  -- Products (Sheet 3)
  products JSONB DEFAULT '[]'::jsonb,
  
  -- FAQs (Sheet 4)
  faqs JSONB DEFAULT '[]'::jsonb,
  
  -- Articles (Sheet 5)
  articles JSONB DEFAULT '[]'::jsonb,
  
  -- Reviews (Sheet 6)
  reviews JSONB DEFAULT '[]'::jsonb,
  
  -- Locations (Sheet 7)
  locations JSONB DEFAULT '[]'::jsonb,
  
  -- Team Members (Sheet 8)
  team_members JSONB DEFAULT '[]'::jsonb,
  
  -- Awards (Sheet 9)
  awards JSONB DEFAULT '[]'::jsonb,
  
  -- Media Mentions (Sheet 10)
  media_mentions JSONB DEFAULT '[]'::jsonb,
  
  -- Case Studies (Sheet 11)
  case_studies JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.client_profile ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for owner access
CREATE POLICY "Users can view their own client profiles" 
ON public.client_profile 
FOR SELECT 
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create client profiles" 
ON public.client_profile 
FOR INSERT 
WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own client profiles" 
ON public.client_profile 
FOR UPDATE 
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own client profiles" 
ON public.client_profile 
FOR DELETE 
USING (auth.uid() = owner_user_id);

-- Create index for faster lookups by owner
CREATE INDEX idx_client_profile_owner ON public.client_profile(owner_user_id);

-- Create index for alphabetical entity name sorting
CREATE INDEX idx_client_profile_entity_name ON public.client_profile(entity_name);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_client_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_profile_updated_at
BEFORE UPDATE ON public.client_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_client_profile_updated_at();
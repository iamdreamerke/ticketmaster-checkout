import { createClient } from '@supabase/supabase-js';

// Replace these placeholders with your actual project credentials from your Supabase Dashboard settings
const supabaseUrl = 'https://mmnibnquuyyixpfsrzpn.supabase.co';
const supabaseAnonKey = 'sb_publishable_Ib50mdNGiChQO0hmEit4FQ_4Qmztv3e';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
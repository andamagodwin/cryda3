import { supabase } from '../utils/supabase';

export async function fetchDrives() {
  const { data, error } = await supabase
    .from('drives')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

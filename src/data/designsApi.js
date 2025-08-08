import { supabase } from '../lib/supabaseClient.js';

export async function listDesigns() {
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createDesign({ name, data, thumbnail }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: row, error } = await supabase
    .from('designs')
    .insert({ name, data, thumbnail, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateDesign(id, { name, data, thumbnail }) {
  const { data: row, error } = await supabase
    .from('designs')
    .update({ name, data, thumbnail })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteDesign(id) {
  const { error } = await supabase.from('designs').delete().eq('id', id);
  if (error) throw error;
}

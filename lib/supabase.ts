import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export type Moodboard = {
  id: string;
  name: string;
  description?: string;
  user_email: string;
  created_at: string;
  updated_at: string;
};

export type MoodboardPin = {
  id: string;
  moodboard_id: string;
  pin_id: string;
  pin_data: any; // Pinterest pin data
  position_x?: number;
  position_y?: number;
  created_at: string;
};

// Helper functions for moodboards
export async function getMoodboardsByEmail(email: string) {
  const { data, error } = await supabase
    .from('moodboards')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Moodboard[];
}

export async function getMoodboardById(id: string) {
  const { data, error } = await supabase
    .from('moodboards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Moodboard;
}

export async function getMoodboardByNameAndEmail(name: string, email: string) {
  const { data, error } = await supabase
    .from('moodboards')
    .select('*')
    .eq('name', name)
    .eq('user_email', email)
    .single();

  if (error) {
    // If no moodboard found, return null instead of throwing an error
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data as Moodboard;
}

export async function createMoodboard(moodboard: Partial<Moodboard>) {
  const { data, error } = await supabase
    .from('moodboards')
    .insert(moodboard)
    .select()
    .single();

  if (error) throw error;
  return data as Moodboard;
}

export async function updateMoodboard(id: string, updates: Partial<Moodboard>) {
  const { data, error } = await supabase
    .from('moodboards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Moodboard;
}

export async function deleteMoodboard(id: string) {
  const { error } = await supabase
    .from('moodboards')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Helper functions for moodboard pins
export async function getMoodboardPins(moodboardId: string) {
  const { data, error } = await supabase
    .from('moodboard_pins')
    .select('*')
    .eq('moodboard_id', moodboardId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MoodboardPin[];
}

export async function addPinToMoodboard(pin: Partial<MoodboardPin>) {
  const { data, error } = await supabase
    .from('moodboard_pins')
    .insert(pin)
    .select()
    .single();

  if (error) throw error;
  return data as MoodboardPin;
}

export async function removePinFromMoodboard(id: string) {
  const { error } = await supabase
    .from('moodboard_pins')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function updatePinPosition(id: string, position_x: number, position_y: number) {
  const { data, error } = await supabase
    .from('moodboard_pins')
    .update({ position_x, position_y })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MoodboardPin;
}

// Create default moodboards for a user if they don't exist
export async function createDefaultMoodboards(email: string) {
  try {
    console.log(`Creating default moodboards for ${email}`);

    // Check if user already has moodboards
    const existingMoodboards = await getMoodboardsByEmail(email);
    console.log(`User has ${existingMoodboards.length} existing moodboards`);

    // If user already has moodboards, don't create defaults
    if (existingMoodboards && existingMoodboards.length > 0) {
      console.log('User already has moodboards, returning existing ones');
      return existingMoodboards;
    }

    // Create 5 default moodboards
    console.log('Creating 5 default moodboards');
    const defaultMoodboards = [];
    for (let i = 1; i <= 5; i++) {
      console.log(`Creating moodboard-${i}`);
      try {
        const moodboard = await createMoodboard({
          name: `moodboard-${i}`,
          description: `Default moodboard ${i}`,
          user_email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log(`Created moodboard-${i} with ID: ${moodboard.id}`);
        defaultMoodboards.push(moodboard);
      } catch (err) {
        console.error(`Error creating moodboard-${i}:`, err);
      }
    }

    console.log(`Successfully created ${defaultMoodboards.length} default moodboards`);
    return defaultMoodboards;
  } catch (error) {
    console.error('Error creating default moodboards:', error);
    throw error;
  }
}

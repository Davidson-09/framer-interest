// Test script to check Supabase connection and create default moodboards
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getMoodboardsByEmail(email) {
  const { data, error } = await supabase
    .from('moodboards')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

async function getMoodboardByNameAndEmail(name, email) {
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
  return data;
}

async function createMoodboard(moodboard) {
  const { data, error } = await supabase
    .from('moodboards')
    .insert(moodboard)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function createDefaultMoodboards(email) {
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

async function testSupabase() {
  try {
    const email = 'davidsonakra@gmail.com';
    const name = 'moodboard-1';
    
    console.log('Testing Supabase connection...');
    
    // Try to get the moodboard
    console.log(`Attempting to get moodboard ${name} for ${email}`);
    let moodboard = await getMoodboardByNameAndEmail(name, email);
    console.log('Moodboard found:', moodboard ? 'Yes' : 'No');
    
    // If moodboard doesn't exist, create default moodboards
    if (!moodboard) {
      console.log(`Moodboard ${name} not found for ${email}, creating default moodboards`);
      
      // Create default moodboards for this user
      const defaultMoodboards = await createDefaultMoodboards(email);
      console.log(`Created ${defaultMoodboards.length} default moodboards`);
      
      // Try to get the moodboard again
      moodboard = await getMoodboardByNameAndEmail(name, email);
      console.log('Moodboard found after creation:', moodboard ? 'Yes' : 'No');
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSupabase();

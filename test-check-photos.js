const { createClient } = require('@supabase/supabase-js');
const url = 'https://bektmgymwjutfnqwrjjb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJla3RtZ3ltd2p1dGZucXdyampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDAyNjQsImV4cCI6MjA5ODg3NjI2NH0.eGCjAgSGKV5_nmHSJw92d4AVgEHp8wjBoiIRTBsIT24';

const client = createClient(url, key);

async function run() {
  const { data: photos, error } = await client
    .from('photos')
    .select('*')
    .limit(5);

  if (error) {
    console.error(error);
    return;
  }

  console.log('Sample Photos:', photos);
}

run();

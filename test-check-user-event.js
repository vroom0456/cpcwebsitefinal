const { createClient } = require('@supabase/supabase-js');
const url = 'https://bektmgymwjutfnqwrjjb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJla3RtZ3ltd2p1dGZucXdyampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDAyNjQsImV4cCI6MjA5ODg3NjI2NH0.eGCjAgSGKV5_nmHSJw92d4AVgEHp8wjBoiIRTBsIT24';

const client = createClient(url, key);

async function run() {
  const eventId = '27f4a06a-e212-44f4-a829-32cf08d8a974';
  const { data: event, error: err1 } = await client.from('events').select('*').eq('id', eventId).single();
  const { data: photos, error: err2 } = await client.from('photos').select('*').eq('event_id', eventId);
  
  if (err1) {
    console.error('Error fetching event:', err1);
    return;
  }
  console.log('Event details:', event);
  console.log('Photos count in DB:', photos ? photos.length : 0);
  if (photos && photos.length > 0) {
    console.log('Sample photo:', photos[0]);
  }
}

run();

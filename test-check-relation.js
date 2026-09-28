const { createClient } = require('@supabase/supabase-js');
const url = 'https://bektmgymwjutfnqwrjjb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJla3RtZ3ltd2p1dGZucXdyampiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMDAyNjQsImV4cCI6MjA5ODg3NjI2NH0.eGCjAgSGKV5_nmHSJw92d4AVgEHp8wjBoiIRTBsIT24';

const client = createClient(url, key);

async function run() {
  // Get all events
  const { data: events, error: err1 } = await client.from('events').select('id, title, photo_count');
  if (err1) {
    console.error(err1);
    return;
  }

  console.log(`Checking ${events.length} events...`);
  
  for (const e of events) {
    if (e.photo_count === 0) continue;
    
    const { data: allPhotos } = await client.from('photos').select('id, is_published').eq('event_id', e.id);
    const publishedCount = allPhotos.filter(p => p.is_published === true).length;
    const unpublishedCount = allPhotos.filter(p => p.is_published === false).length;
    const nullCount = allPhotos.filter(p => p.is_published === null).length;
    
    console.log(`Event "${e.title}" (ID: ${e.id}):`);
    console.log(`  - DB photo_count field value: ${e.photo_count}`);
    console.log(`  - Actual photos found in photos table: ${allPhotos.length}`);
    console.log(`  -   is_published = true: ${publishedCount}`);
    console.log(`  -   is_published = false: ${unpublishedCount}`);
    console.log(`  -   is_published = null: ${nullCount}`);
  }
}

run();

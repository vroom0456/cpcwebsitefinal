import { createClient } from "../lib/supabase/server";

async function run() {
  const supabase = await createClient();
  const builder = supabase.from("events");
  // This should compile if server.ts's client type is inferred correctly
  const testVal = builder.insert({
    title: "Test Event",
    slug: "test-event",
  });
}

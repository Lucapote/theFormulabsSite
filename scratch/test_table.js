import { createClient } from "@supabase/supabase-js";

const url = "https://wtulxzqoitrrthsbdisi.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dWx4enFvaXRycnRoc2JkaXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NzU1OTIsImV4cCI6MjEwNjU1MTU5Mn0.WYR34bhO8Rdp7dCXO38chTccHlZxcfuooewdHLQvGhE";

const supabase = createClient(url, key);

async function test() {
  console.log("Checking proposals table...");
  const { data, error } = await supabase.from("proposals").select("*").limit(1);
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Proposals table exists! Data:", data);
  }
}

test();

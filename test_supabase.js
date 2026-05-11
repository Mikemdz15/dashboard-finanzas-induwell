const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://sqfzzjzyoauelfgjhavv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnp6anp5b2F1ZWxmZ2poYXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDE1MjgsImV4cCI6MjA5NDExNzUyOH0.PjXcDq8fJWh-gMJU2rZINpixMcLXBelA8Cr5g-YrsHk');

async function test() {
  console.log("Testing Supabase Insert...");
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        business_unit: 'total',
        period: 'YTD',
        component_id: 'kpis',
        text: 'Prueba de insercion',
        user_name: 'Tester'
      }
    ]);
    
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Success inserting:", data);
  }
}

test();

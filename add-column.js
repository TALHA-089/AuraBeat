const https = require('https');

const payload = JSON.stringify({
  query: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;"
});

const options = {
  hostname: 'hpkklopnsnmuxpgyzgcx.supabase.co',
  path: '/rest/v1/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length,
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa2tsb3Buc25tdXhwZ3l6Z2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE2MDY0NCwiZXhwIjoyMDkzNzM2NjQ0fQ.JoqdNO_g7d2zVy4gik-V4It9YBqpzfjZtpwngw56qY4'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(payload);
req.end();

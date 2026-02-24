#!/usr/bin/env npx tsx
/**
 * Creates a Browserbase session and opens the Amazon DSP login page.
 * User logs in + enters OTP, then the session ID is passed to dispute-agent.ts.
 * 
 * Usage:
 *   npx tsx scripts/create-session.ts
 * 
 * Output:
 *   - Session ID to pass to dispute-agent.ts
 *   - Live view URL for the user to log in
 */

import Browserbase from '@browserbasehq/sdk';

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY || '';
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID || '';

async function main() {
  if (!BROWSERBASE_API_KEY || !BROWSERBASE_PROJECT_ID) {
    console.error('❌ Set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID env vars');
    process.exit(1);
  }

  console.log('🆕 Creating Browserbase session...');
  
  const bb = new Browserbase({ apiKey: BROWSERBASE_API_KEY });
  
  const session = await bb.sessions.create({
    projectId: BROWSERBASE_PROJECT_ID,
    keepAlive: true, // Keep session alive while user authenticates
  });

  console.log('\n✅ Session created!');
  console.log(`\n📺 Open this URL to log in:`);
  console.log(`   https://www.browserbase.com/sessions/${session.id}/live-view`);
  console.log(`\n🔑 After logging in + entering OTP, run:`);
  console.log(`   BROWSERBASE_SESSION_ID=${session.id} npx tsx scripts/dispute-agent.ts`);
  console.log(`\n⏳ Session will stay alive for you to authenticate.`);
  console.log(`   Session ID: ${session.id}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

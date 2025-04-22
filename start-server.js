/**
 * Server startup utility script (ES module version)
 * 
 * This script helps ensure the backend server is running correctly
 * by using ts-node to run the TypeScript server code
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}=== Hackathon Platform Backend Starter ===${colors.reset}`);
console.log(`${colors.cyan}Checking environment...${colors.reset}`);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log(`${colors.yellow}No .env file found. Creating one with default settings...${colors.reset}`);
  const defaultEnv = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/hackathon-platform
JWT_SECRET=hackathon-platform-secret
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log(`${colors.green}.env file created with default settings.${colors.reset}`);
}

console.log(`${colors.cyan}Starting backend server with ts-node...${colors.reset}`);

// Start server using ts-node
const server = spawn('npx', ['ts-node', '--esm', 'server.ts'], {
  stdio: 'inherit',
  shell: true
});

// Handle process events
server.on('error', (err) => {
  console.error(`${colors.red}Failed to start server:${colors.reset}`, err.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(`${colors.yellow}Stopping server...${colors.reset}`);
  server.kill('SIGINT');
  process.exit(0);
});

// Display help message
console.log('\n');
console.log(`${colors.green}If the server started successfully, you should see connection messages above.${colors.reset}`);
console.log(`${colors.cyan}The API should now be available at: ${colors.reset}http://localhost:5000/api`);
console.log(`${colors.cyan}Now you can start the frontend with:${colors.reset} npm run dev`);
console.log(`${colors.yellow}Press Ctrl+C to stop the server when done.${colors.reset}`); 
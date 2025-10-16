import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env file manually before any other imports
try {
  const envPath = resolve(process.cwd(), '.env');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (err) {
  console.warn('Could not load .env file:', err);
}

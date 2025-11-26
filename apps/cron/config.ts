/**
 * Configuration file for the Glance CRON job
 */

// Load environment variables from .env file
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", "..", ".env.local") });

interface SupabaseConfig {
  url: string | undefined;
  serviceKey: string | undefined;
}

interface NorthwesternConfig {
  username: string | undefined;
  password: string | undefined;
}

interface PanoptoConfig {
  server: string;
  searchTimeout: number;
  navigationTimeout: number;
}

interface TwentyFiveLiveConfig {
  baseUrl: string;
  apiEndpoint: string;
}

interface BrowserConfig {
  headless: boolean;
  timeout: number;
}

interface Config {
  supabase: SupabaseConfig;
  northwestern: NorthwesternConfig;
  panopto: PanoptoConfig;
  twentyFiveLive: TwentyFiveLiveConfig;
  browser: BrowserConfig;
  validate(): boolean;
}

const config: Config = {
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Northwestern credentials
  northwestern: {
    username: process.env.NORTHWESTERN_USERNAME,
    password: process.env.NORTHWESTERN_PASSWORD,
  },

  // Panopto configuration
  panopto: {
    server: "https://kellogg-northwestern.hosted.panopto.com",
    searchTimeout: 10000,
    navigationTimeout: 15000,
  },

  // 25Live configuration
  twentyFiveLive: {
    baseUrl: "https://25live.collegenet.com",
    apiEndpoint: "https://25live.collegenet.com/25live/data/northwestern/run",
  },

  // Browser configuration
  browser: {
    headless: true,
    timeout: 30000,
  },

  // Validation
  validate() {
    const required = [
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "NORTHWESTERN_USERNAME",
      "NORTHWESTERN_PASSWORD",
    ];

    const missing = required.filter((key) => {
      return !process.env[key];
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }

    return true;
  },
};

export default config;

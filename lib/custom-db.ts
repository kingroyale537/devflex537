import fs from "fs";
import path from "path";
import { Profile, UserProject, LinkedInProfile } from "@/types/types";

export interface CustomUserRecord {
  username: string;
  profile: Profile;
  projects: UserProject;
  linkedin: LinkedInProfile;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "custom_users.json");

// Ensure directory and database file exist
const ensureDbExists = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2), "utf-8");
  }
};

export const getCustomUser = async (username: string): Promise<CustomUserRecord | null> => {
  try {
    ensureDbExists();
    const dataStr = fs.readFileSync(DB_FILE, "utf-8");
    const db: Record<string, CustomUserRecord> = JSON.parse(dataStr);
    
    const key = username.toLowerCase().trim();
    return db[key] || null;
  } catch (error) {
    console.error("Error reading custom database:", error);
    return null;
  }
};

export const saveCustomUser = async (record: CustomUserRecord): Promise<boolean> => {
  try {
    ensureDbExists();
    const dataStr = fs.readFileSync(DB_FILE, "utf-8");
    const db: Record<string, CustomUserRecord> = JSON.parse(dataStr);
    
    const key = record.username.toLowerCase().trim();
    db[key] = record;
    
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to custom database:", error);
    return false;
  }
};

// ---------- Core domain types ----------

export type EventCategory =
  | "Technical"
  | "Cultural"
  | "Sports"
  | "Workshop"
  | "Seminar"
  | "Hackathon"
  | "Social"
  | "Aerospace"
  | "Robotics"
  | "Entrepreneurship";

export type ClubCategory =
  | "Technical"
  | "Cultural"
  | "Sports"
  | "Aerospace"
  | "Robotics"
  | "Entrepreneurship"
  | "Social";

export interface Officer {
  name: string;
  role: string;
  color: string; // avatar gradient
}

export interface Club {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ClubCategory;
  members: number;
  founded: string;
  logo: string; // emoji
  gradient: [string, string]; // tailwind gradient classes
  officers: Officer[];
  achievements: string[];
  socials: { label: string; handle: string }[];
}

export interface EventItem {
  id: string;
  title: string;
  clubId: string;
  category: EventCategory;
  description: string;
  longDescription: string[];
  date: string; // ISO
  time: string; // "4:00 PM"
  venue: string;
  capacity: number;
  registrations: number;
  points?: number; // participation points
  tags: string[];
  gradient: [string, string];
  emoji: string;
  isFeatured?: boolean;
  prizes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string; // ISO
  clubId?: string;
  priority: "normal" | "important" | "urgent";
  author: string;
}

export interface AppUser {
  name: string;
  email: string;
  regNo: string;
  branch: string;
  year: string;
  color: string;
  isClubAdmin: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

export type RsvpStatus = "going" | "saved" | null;

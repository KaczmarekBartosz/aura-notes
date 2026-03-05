import type { LucideIcon } from "lucide-react-native";
import {
  Activity,
  Archive,
  Bookmark,
  Calendar,
  ChefHat,
  Cpu,
  PenTool,
  Sparkles,
  TrendingUp,
  ShieldCheck
} from "lucide-react-native";

export const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  "fitness-health": { label: "Fitness", icon: Activity },
  "golden-protocols": { label: "Golden Protocols", icon: ShieldCheck },
  "ai-agents": { label: "AI", icon: Cpu },
  "bookmarks": { label: "Bookmarks", icon: Bookmark },
  "design": { label: "Design", icon: PenTool },
  "daily-log": { label: "Daily", icon: Calendar },
  "growth-marketing": { label: "Marketing", icon: TrendingUp },
  "outputs": { label: "Outputs", icon: Archive },
  "recipes": { label: "Przepisy", icon: ChefHat },
  "taste": { label: "Taste", icon: Sparkles }
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_META[category]?.label ?? category;
}

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_META[category]?.icon ?? Archive;
}

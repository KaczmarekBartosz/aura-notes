import * as Haptics from "expo-haptics";

type HapticType = "light" | "medium" | "success" | "warning" | "error";

export async function triggerHaptic(type: HapticType = "light") {
  try {
    switch (type) {
      case "medium":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      case "success":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      case "warning":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      case "error":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      case "light":
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Best-effort only.
  }
}


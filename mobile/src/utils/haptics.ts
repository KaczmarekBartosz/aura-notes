import * as Haptics from "expo-haptics";

type HapticType = "selection" | "light" | "medium" | "heavy" | "soft" | "rigid" | "success" | "warning" | "error";

export async function triggerHaptic(type: HapticType = "light") {
  try {
    switch (type) {
      case "selection":
        await Haptics.selectionAsync();
        return;
      case "medium":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      case "heavy":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        return;
      case "soft":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        return;
      case "rigid":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
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

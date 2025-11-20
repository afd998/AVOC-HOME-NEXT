export function getStatusVariant(status: string): "affirmative" | "destructive" | "secondary" | "outline" {
  switch (status.trim().toLowerCase()) {
    case "completed":
      return "affirmative";
    case "cancelled":
    case "canceled":
      return "destructive";
    case "in progress":
    case "processing":
      return "secondary";
    default:
      return "outline";
  }
}


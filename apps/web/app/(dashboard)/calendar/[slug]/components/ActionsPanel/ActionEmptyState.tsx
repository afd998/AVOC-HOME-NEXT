type ActionEmptyStateProps = {
  message?: string;
};

export default function ActionEmptyState({
  message = "No actions scheduled for this date.",
}: ActionEmptyStateProps) {
  return (
    <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
      {message}
    </p>
  );
}


interface ActionInstructionsProps {
  instructions: string[];
}

export default function ActionInstructions({
  instructions,
}: ActionInstructionsProps) {
  const hasInstructions = instructions.length > 0;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        Instructions
      </h3>
      {hasInstructions ? (
        <div className="flex flex-col gap-3">
          {instructions.map((text, index) => (
            <p
              key={`instruction-${index}`}
              className="whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground"
            >
              {text}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No instructions provided for this action.
        </p>
      )}
    </section>
  );
}


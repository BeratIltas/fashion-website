export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-neutral-400 animate-typing-dot"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

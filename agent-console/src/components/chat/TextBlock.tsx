export function TextBlock({ content }: { content: string }) {
  return (
    <div className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100 py-1">
      {content}
    </div>
  );
}

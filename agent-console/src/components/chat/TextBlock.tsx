export function TextBlock({ content }: { content: string }) {
  return (
    <div className="whitespace-pre-wrap font-sans text-gray-200 py-2 leading-relaxed text-[15px]">
      {content}
    </div>
  );
}

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface DailyJournalProps {
  content: string;
  onChange: (content: string) => void;
  isSaving: boolean;
}

export function DailyJournal({ content, onChange, isSaving }: DailyJournalProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Write your daily update here...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[500px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false, // Fix hydration mismatch
  });

  // Sync content if it changes externally (e.g. loading)
  // But be careful not to overwrite user typing if we add debouncing upstream
  // Actually, for initial load it's fine.
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
       // Only set content if it's significantly different to avoid cursor jumps
       // Ideally we only set it on initial load.
       // For now, let's assume content prop is stable or we handle it in parent.
       if (editor.getText() === "" && content !== "<p></p>") {
           editor.commands.setContent(content);
       }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative border border-neutral-800 rounded-lg bg-neutral-900/50 p-6">
      {isSaving && (
        <div className="absolute top-2 right-2 text-xs text-neutral-500 animate-pulse">
          Saving...
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

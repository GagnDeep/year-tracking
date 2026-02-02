"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface DailyJournalProps {
  content: string;
  onChange: (content: string) => void;
  isSaving: boolean;
}

export function DailyJournal({ content, onChange, isSaving }: DailyJournalProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write about your day...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync content if it changes externally (e.g. initial load)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
        // Avoid cursor jump if focused?
        // Only set if editor is empty or drastically different?
        // For simple sync:
        if (Math.abs(editor.getText().length - content.length) > 5) {
             editor.commands.setContent(content);
        }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col border border-border rounded-lg bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 transition-all shadow-sm">
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-6 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
         <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-6 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <div className="ml-auto text-xs text-muted-foreground px-2">
            {isSaving ? "Saving..." : "Saved"}
        </div>
      </div>
      <EditorContent editor={editor} className="min-h-[300px]" />
    </div>
  );
}

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Strikethrough, Code, List, ListOrdered } from "lucide-react";

export function JournalEditor({ date }: { date: Date }) {
  const { data: entry, isLoading } = api.journal.getByDate.useQuery({ date });

  const upsertEntry = api.journal.upsert.useMutation();

  const debouncedUpsert = useDebouncedCallback((newContent: string) => {
    upsertEntry.mutate({ date: date, content: newContent });
  }, 1000);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedUpsert(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[300px]",
      },
    },
  });

  useEffect(() => {
    if (editor && entry?.content) {
       // Only set content if it's different to avoid cursor jumping if we were fetching
       // But initial load is fine.
       if (editor.getHTML() !== entry.content) {
           editor.commands.setContent(entry.content);
       }
    }
  }, [entry, editor]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="border rounded-md p-4 bg-background">
      {editor && (
        <div className="flex items-center gap-1 mb-2 border-b pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-muted" : ""}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-muted" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-muted" : ""}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "bg-muted" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-muted" : ""}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      )}
      <EditorContent editor={editor} />
      <div className="text-xs text-muted-foreground mt-2 text-right">
        {upsertEntry.isPending ? "Saving..." : "Saved"}
      </div>
    </div>
  );
}

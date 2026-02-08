"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function JournalEditor({ date }: { date: Date }) {
  const { data: entry, isLoading } = api.journal.getByDate.useQuery({ date });
  const [wordCount, setWordCount] = useState(0);

  const upsertEntry = api.journal.upsert.useMutation();

  const debouncedUpsert = useDebouncedCallback((newContent: string) => {
    upsertEntry.mutate({ date: date, content: newContent });
  }, 1000);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setWordCount(editor.storage.characterCount?.words() || editor.getText().split(/\s+/).filter(w => w.length > 0).length);
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
           setWordCount(editor.getText().split(/\s+/).filter(w => w.length > 0).length);
       }
    } else if (editor && !entry) {
        editor.commands.clearContent();
        setWordCount(0);
    }
  }, [entry, editor]);

  const handleClear = () => {
      editor?.commands.clearContent();
      debouncedUpsert("");
      setWordCount(0);
  }

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="border rounded-md p-4 bg-background flex flex-col h-full">
      {editor && (
        <div className="flex items-center justify-between mb-2 border-b pb-2">
            <div className="flex items-center gap-1">
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
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{wordCount} words</span>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Clear Journal Entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove all content for this date. This action cannot be undone immediately.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Clear</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      )}
      <EditorContent editor={editor} className="flex-1" />
      <div className="text-xs text-muted-foreground mt-2 text-right">
        {upsertEntry.isPending ? "Saving..." : "Saved"}
      </div>
    </div>
  );
}

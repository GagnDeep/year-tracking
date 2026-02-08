"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import { Toggle } from "@/components/ui/toggle";
import { api } from "@/trpc/react";

const Editor = ({ initialContent, date }: { initialContent: string; date: string }) => {
  const [isSaving, setIsSaving] = useState(false);

  const upsertEntry = api.journal.upsert.useMutation({
      onMutate: () => setIsSaving(true),
      onSuccess: () => {
          setIsSaving(false);
      },
      onError: () => {
          setIsSaving(false);
          toast.error("Failed to save journal");
      }
  });

  const debouncedSave = useDebouncedCallback((content: string) => {
      upsertEntry.mutate({ date, content });
  }, 1000);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4",
      },
    },
  });

  // Sync content if initialContent changes (e.g. date change)
  useEffect(() => {
      if (editor && initialContent && initialContent !== editor.getHTML()) {
          editor.commands.setContent(initialContent);
      }
  }, [initialContent, editor]);


  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b bg-muted/20">
        <div className="flex gap-1">
            <Toggle
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                size="sm"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                size="sm"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                size="sm"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                pressed={editor.isActive("code")}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                size="sm"
            >
                <Code className="h-4 w-4" />
            </Toggle>
            <Toggle
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                size="sm"
            >
                <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                size="sm"
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                </>
            ) : (
                "Saved"
            )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;

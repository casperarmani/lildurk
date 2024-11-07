import { useRef } from "react";
import { Paperclip, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, files, setFiles, onSend, isLoading }: ChatInputProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const videoFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('video/mp4')
      );
      
      if (videoFiles.length !== e.target.files.length) {
        toast({
          title: "Invalid file type",
          description: "Only MP4 videos are supported",
          variant: "destructive",
        });
      }
      
      setFiles(videoFiles);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || files.length > 0) {
        onSend();
      }
    }
  };

  return (
    <div className="relative">
      {files.length > 0 && (
        <div className="absolute bottom-full mb-2 left-0 right-0">
          <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">
                {files.length} video file{files.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                className="text-white/60 hover:text-white/90"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex items-end space-x-2">
        <div className="flex-grow">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className={cn(
              "min-h-[52px] w-full resize-none bg-gradient-to-r from-white/15 to-white/10",
              "backdrop-blur-xl rounded-2xl px-4 py-3 text-white placeholder-white/40",
              "border border-white/20 focus:ring-2 ring-white/20 shadow-lg",
              "text-sm leading-relaxed",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
            disabled={isLoading}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-[52px] w-[52px] rounded-xl bg-gradient-to-r from-white/15 to-white/10",
              "backdrop-blur-xl border border-white/20 hover:bg-white/20",
              "text-white/60 hover:text-white/90 transition-colors",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            className={cn(
              "h-[52px] w-[52px] rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500",
              "hover:from-indigo-600 hover:to-purple-600 transition-colors",
              "text-white shadow-lg border border-white/20",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            onClick={onSend}
            disabled={isLoading || (!input.trim() && files.length === 0)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
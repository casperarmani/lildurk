import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/lib/api-client";
import { User } from "@supabase/supabase-js";
import { format, isValid, parseISO } from "date-fns";
import { Bot, User as UserIcon } from "lucide-react";

interface MessageItemProps {
  message: ChatMessage;
  user: User | null;
}

export function MessageItem({ message, user }: MessageItemProps) {
  const isUserMessage = message.message !== message.response;
  const content = isUserMessage ? message.message : message.response;
  
  // Safely handle timestamp
  const formattedTime = message.created_at 
    ? isValid(parseISO(message.created_at))
      ? format(parseISO(message.created_at), 'HH:mm')
      : ''
    : '';

  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex items-start max-w-[80%] ${isUserMessage ? 'flex-row-reverse' : ''}`}>
        <Avatar className="w-8 h-8 border-2 border-white/20 shadow-lg">
          {isUserMessage ? (
            user?.user_metadata?.avatar_url ? (
              <AvatarImage src={user.user_metadata.avatar_url} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            )
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className={`mx-2 ${isUserMessage ? 'ml-2' : 'mr-2'}`}>
          <div className={`p-4 rounded-2xl backdrop-blur-sm shadow-lg ${
            isUserMessage 
              ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10' 
              : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10'
          }`}>
            <div className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap break-words">
              {content || 'Loading...'}
            </div>
            
            {message.metadata && Object.keys(message.metadata).length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-xs text-white/60 space-y-1">
                  {message.metadata.duration && (
                    <p className="flex items-center">
                      <span className="font-medium">Duration:</span>
                      <span className="ml-2">{message.metadata.duration}</span>
                    </p>
                  )}
                  {message.metadata.resolution && (
                    <p className="flex items-center">
                      <span className="font-medium">Resolution:</span>
                      <span className="ml-2">{message.metadata.resolution}</span>
                    </p>
                  )}
                  {message.metadata.format && (
                    <p className="flex items-center">
                      <span className="font-medium">Format:</span>
                      <span className="ml-2">{message.metadata.format}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {formattedTime && (
            <div className={`text-xs text-white/40 mt-1 ${isUserMessage ? 'text-right' : 'text-left'}`}>
              {formattedTime}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { InterviewMessage } from '../../types';

interface ChatInterfaceProps {
  messages: InterviewMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
  isComplete: boolean;
  phase: string;
  progress: number;
}

const PHASE_LABELS: Record<string, string> = {
  personal: 'Personal Info',
  education: 'Education',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  target: 'Target Role',
};

const PHASES = ['personal', 'education', 'skills', 'experience', 'projects', 'certifications', 'achievements', 'target'];

export function ChatInterface({ messages, onSendMessage, isSending, isComplete, phase, progress }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || isComplete) return;

    setInput('');
    await onSendMessage(trimmed);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentPhaseIndex = PHASES.indexOf(phase);

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phase: {PHASE_LABELS[phase] || phase}
          </span>
          <span className="text-sm text-brand-600 font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex mt-2 gap-1 overflow-x-auto pb-1">
          {PHASES.map((p, i) => (
            <span
              key={p}
              className={cn(
                'text-xs px-2 py-0.5 rounded-full whitespace-nowrap transition-colors',
                i < currentPhaseIndex
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : i === currentPhaseIndex
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 font-medium'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
              )}
            >
              {i < currentPhaseIndex && '✓ '}
              {PHASE_LABELS[p]}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {isSending && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center justify-center gap-2 py-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-green-600 font-semibold">Interview Complete! Ready to generate your resume.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer... (Enter to send)"
              rows={2}
              className={cn(
                'flex-1 resize-none rounded-xl border px-4 py-3 text-sm',
                'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600',
                'text-gray-900 dark:text-gray-100 placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                'transition-colors'
              )}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              isLoading={isSending}
              size="lg"
              className="rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Share as much detail as possible — more detail = better resume
          </p>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: InterviewMessage }) {
  const isAI = message.role === 'assistant';

  return (
    <div className={cn('flex gap-3 items-start', !isAI && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isAI ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-600'
        )}
      >
        {isAI ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl text-sm',
          isAI
            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none text-gray-800 dark:text-gray-200'
            : 'bg-brand-600 text-white rounded-tr-none'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p className={cn('text-xs mt-1', isAI ? 'text-gray-400' : 'text-brand-200')}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

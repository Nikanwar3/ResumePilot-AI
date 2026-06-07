import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { interviewApi } from '../api/interview.api';
import { useInterviewStore } from '../store/interviewStore';
import { ChatInterface } from '../components/interview/ChatInterface';
import { Button } from '../components/ui/Button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function Interview() {
  const navigate = useNavigate();
  const {
    currentSession,
    messages,
    isSending,
    isComplete,
    phase,
    progress,
    setSession,
    addMessage,
    setSending,
    updateProgress,
    setComplete,
  } = useInterviewStore();

  // Fetch existing active session
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['interview-sessions'],
    queryFn: () => interviewApi.getSessions(),
  });

  const { mutate: createSession } = useMutation({
    mutationFn: () => interviewApi.createSession(),
    onSuccess: (res) => {
      if (res.data) {
        setSession(res.data);
      }
    },
    onError: () => toast.error('Failed to start interview session'),
  });

  useEffect(() => {
    if (!sessionsData) return;
    const sessions = sessionsData.data || [];
    const active = sessions.find((s) => s.status === 'active');

    if (active) {
      setSession(active);
    } else if (!currentSession) {
      createSession();
    }
  }, [sessionsData]);

  const { mutate: sendMessage } = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      interviewApi.sendMessage(sessionId, message),
    onMutate: () => setSending(true),
    onSuccess: (res) => {
      if (res.data) {
        const { session, phase: newPhase, progress: newProgress, isComplete: done } = res.data;
        setSession(session);
        updateProgress(newPhase, newProgress);
        if (done) setComplete(true);
      }
    },
    onError: () => toast.error('Failed to send message'),
    onSettled: () => setSending(false),
  });

  const { mutate: extractProfile } = useMutation({
    mutationFn: (sessionId: string) => interviewApi.extractProfile(sessionId),
    onSuccess: () => {
      toast.success('Profile extracted and saved!');
      navigate('/resumes');
    },
    onError: () => toast.error('Failed to extract profile'),
  });

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!currentSession) return;
      addMessage({ role: 'user', content: message, timestamp: new Date().toISOString() });
      sendMessage({ sessionId: currentSession.id, message });
    },
    [currentSession, addMessage, sendMessage]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Starting your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Interview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Answer naturally — the AI will ask follow-up questions
          </p>
        </div>
        {isComplete && (
          <Button
            onClick={() => currentSession && extractProfile(currentSession.id)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            leftIcon={<CheckCircle className="w-4 h-4" />}
          >
            Generate Resume Now
          </Button>
        )}
      </div>

      <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isSending={isSending}
          isComplete={isComplete}
          phase={phase}
          progress={progress}
        />
      </div>
    </div>
  );
}

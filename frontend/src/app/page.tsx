'use client';

import { useState, useEffect } from 'react';
import { ChatLayout } from '@/components/templates/ChatLayout';
import { AuthModal } from '@/components/molecules/AuthModal';
import { useAuthStore } from '@/store/auth';

export default function ChatPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!isAuthenticated);

  useEffect(() => {
    setIsAuthModalOpen(!isAuthenticated);
  }, [isAuthenticated]);

  return (
    <>
      <ChatLayout />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

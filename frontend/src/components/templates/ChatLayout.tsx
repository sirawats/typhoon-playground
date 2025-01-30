'use client';
import { useState } from 'react';
import { Navbar } from '../organisms/Navbar';
import { History } from '../organisms/History';
import { ChatContainer } from '../organisms/ChatContainer';
import { Parameters } from '../organisms/Parameters';
import { FaSliders } from 'react-icons/fa6';
import { FaHistory } from 'react-icons/fa';

export function ChatLayout() {
  const [showHistory, setShowHistory] = useState(false);
  const [showParams, setShowParams] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-surface">
      <Navbar />
      <div className="relative flex h-screen flex-col overflow-hidden">
        {/* Rainbow gradient background */}
        <div className="absolute inset-x-0 top-[579px] h-[663px] bg-gradient-to-r from-[#A77BE8] via-[#F0BFAA] to-[#6CA1C7] blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-b from-transparent via-[rgba(18,18,21,0.6)] to-[#121215]" />

        {/* Mobile Controls */}
        <div className="relative flex justify-between p-4 md:hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="rounded-full bg-background p-3"
          >
            <FaHistory className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={() => setShowParams(!showParams)}
            className="rounded-full bg-background p-3"
          >
            <FaSliders className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="relative mx-auto mt-4 flex max-h-[629px] w-full max-w-[1400px] flex-1 rounded-l p-2">
          {/* History Panel */}
          <aside
            className={`absolute z-20 h-full w-80 transition-transform duration-300 ease-in-out md:relative md:w-64 ${
              showHistory
                ? 'translate-x-0'
                : '-translate-x-full md:translate-x-0'
            }`}
          >
            <div className="h-full rounded-bl-2xl rounded-tl-2xl bg-background/80 backdrop-blur">
              <History onClose={() => setShowHistory(false)} />
            </div>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 bg-background/80 backdrop-blur">
            <ChatContainer />
          </main>

          {/* Parameters Panel */}
          <aside
            className={`absolute right-0 z-20 h-full w-80 transition-transform duration-300 ease-in-out md:relative ${
              showParams ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
            }`}
          >
            <div className="h-full rounded-br-2xl rounded-tr-2xl bg-background/80 backdrop-blur">
              <Parameters onClose={() => setShowParams(false)} />
            </div>
          </aside>
        </div>
      </div>

      {/* Overlay for mobile when panels are open */}
      {(showHistory || showParams) && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => {
            setShowHistory(false);
            setShowParams(false);
          }}
        />
      )}
    </div>
  );
}

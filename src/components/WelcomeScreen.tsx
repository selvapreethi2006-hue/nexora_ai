import React from 'react';
import { NexoraLogo } from './NexoraLogo';
import {
  Code,
  Lightbulb,
  Compass,
  FileSearch,
  Cpu,
  BookOpen,
  Sparkles,
  ArrowRight,
  Globe2,
} from 'lucide-react';

interface SuggestionCard {
  title: string;
  desc: string;
  icon: React.ReactNode;
  prompt: string;
  category: string;
}

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  preferredLanguage: string;
  onSelectLanguage: (lang: 'auto' | 'en' | 'ta' | 'tanglish') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  preferredLanguage,
  onSelectLanguage,
}) => {
  const suggestions: SuggestionCard[] = [
    {
      title: 'Help me build an AI project',
      desc: 'Architecture, tech stack, and step-by-step roadmap for intelligent applications.',
      icon: <Cpu className="text-violet-400" size={20} />,
      category: 'Architecture',
      prompt: 'Help me build an AI project from scratch. Suggest modern tech stacks, system architecture, and an execution roadmap.',
    },
    {
      title: 'Explain a difficult concept',
      desc: 'Break down quantum computing, transformer models, or complex math simply.',
      icon: <BookOpen className="text-cyan-400" size={20} />,
      category: 'Learning',
      prompt: 'Explain the concept of Transformer self-attention mechanisms like I am an enthusiastic intermediate developer.',
    },
    {
      title: 'Help me write or debug code',
      desc: 'Refactor functions, debug race conditions, or build full TypeScript components.',
      icon: <Code className="text-emerald-400" size={20} />,
      category: 'Coding',
      prompt: 'Help me design a resilient, high-performance async rate limiter in TypeScript with clean error handling.',
    },
    {
      title: 'Help me plan my career',
      desc: 'Strategic skills matrix, portfolio roadmap, and interview prep in AI & Software.',
      icon: <Compass className="text-amber-400" size={20} />,
      category: 'Career',
      prompt: 'Provide a structured 6-month roadmap to transition into a Senior Full-Stack AI Engineer role.',
    },
    {
      title: 'Analyze a document',
      desc: 'Upload PDFs, text logs, or codebases to extract key insights and answers.',
      icon: <FileSearch className="text-pink-400" size={20} />,
      category: 'Analysis',
      prompt: 'What are the best frameworks and methods for analyzing complex structured and unstructured documentation with AI?',
    },
    {
      title: 'Brainstorm creative ideas',
      desc: 'Explore novel startup concepts, viral product hooks, or creative narratives.',
      icon: <Lightbulb className="text-yellow-400" size={20} />,
      category: 'Creative',
      prompt: 'Brainstorm 5 innovative, practical SaaS ideas combining multimodal AI with modern developer productivity.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full my-auto text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/60 border border-violet-700/50 text-violet-300 text-xs font-medium mb-6 backdrop-blur-sm shadow-inner">
        <Sparkles size={14} className="text-cyan-400" />
        <span>Next-Generation Intelligent Assistant</span>
      </div>

      {/* Hero Logo & Heading */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/30 shadow-[0_0_40px_rgba(124,58,237,0.25)]">
          <NexoraLogo size={56} />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Nexora AI</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Your intelligent AI companion. What can I help you with today?
          </p>
        </div>
      </div>

      {/* Language Quick Switcher */}
      <div className="flex items-center justify-center gap-1.5 p-1 mb-8 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <span className="px-2.5 text-slate-400 flex items-center gap-1">
          <Globe2 size={13} className="text-cyan-400" /> Language:
        </span>
        <button
          onClick={() => onSelectLanguage('en')}
          className={`px-3 py-1 rounded-lg transition-all font-medium ${
            preferredLanguage === 'en'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          English
        </button>
        <button
          onClick={() => onSelectLanguage('ta')}
          className={`px-3 py-1 rounded-lg transition-all font-medium ${
            preferredLanguage === 'ta'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          தமிழ் (Tamil)
        </button>
        <button
          onClick={() => onSelectLanguage('tanglish')}
          className={`px-3 py-1 rounded-lg transition-all font-medium ${
            preferredLanguage === 'tanglish'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tanglish
        </button>
      </div>

      {/* Interactive Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full text-left">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative flex flex-col justify-between p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/80 hover:border-violet-500/50 transition-all duration-200 hover:shadow-[0_4px_24px_rgba(124,58,237,0.12)] text-left cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-violet-400 group-hover:text-cyan-400 transition-colors mt-3">
              <span>Start conversation</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

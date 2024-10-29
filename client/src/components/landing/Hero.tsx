import { SignUpButton } from '@clerk/clerk-react';
import { ArrowRight, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950 via-purple-900 to-fuchsia-900" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_-20%,#7928CA,transparent)]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_80%,#FF0080,transparent)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-purple-400/30 bg-purple-500/10 backdrop-blur-sm mb-8">
          <Star className="w-4 h-4 text-yellow-400 mr-2" />
          <span className="text-sm text-purple-200">The Ultimate Community Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Connect Beyond
          </span>
          <br />
          <span className="text-white">
            Boundaries
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          All-in-one platform for communities with real-time chat, video calls, 
          task management, wiki system, and much more.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <SignUpButton mode="modal">
            <button className="w-full md:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all duration-200 flex items-center justify-center group">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </SignUpButton>
          
          <button className="w-full md:w-auto px-8 py-4 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium transition-all duration-200">
            Explore Communities
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Chat</h3>
            <p className="text-gray-400">End-to-end encrypted messaging with rich media support</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">HD Video Calls</h3>
            <p className="text-gray-400">Crystal clear video meetings with noise suppression</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Event Planning</h3>
            <p className="text-gray-400">Schedule and manage community events seamlessly</p>
          </div>
        </div>
      </div>
    </section>
  );
}
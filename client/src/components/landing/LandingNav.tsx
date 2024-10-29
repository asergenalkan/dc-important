import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

export default function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TalkNow
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#community" className="text-sm text-gray-300 hover:text-white transition-colors">
              Community
            </a>
            <a href="#support" className="text-sm text-gray-300 hover:text-white transition-colors">
              Support
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm text-white hover:text-white/90 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                Sign Up Free
              </button>
            </SignUpButton>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-6">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#community" className="text-gray-300 hover:text-white transition-colors">
                Community
              </a>
              <a href="#support" className="text-gray-300 hover:text-white transition-colors">
                Support
              </a>
              <div className="pt-4 flex flex-col space-y-2">
                <SignInButton mode="modal">
                  <button className="w-full px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                    Sign Up Free
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
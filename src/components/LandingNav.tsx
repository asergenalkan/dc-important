import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

export default function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-transparent py-6 px-6 relative z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-white text-2xl font-bold">Nexus</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-200 hover:text-white transition-colors">Features</a>
            <a href="#community" className="text-gray-200 hover:text-white transition-colors">Community</a>
            <a href="#support" className="text-gray-200 hover:text-white transition-colors">Support</a>
            <a href="#blog" className="text-gray-200 hover:text-white transition-colors">Blog</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <SignInButton mode="modal">
              <button className="group relative overflow-hidden px-6 py-2 rounded-xl bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="relative text-white font-medium">Sign In</span>
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
                Sign Up
              </button>
            </SignUpButton>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl mx-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-white hover:text-gray-200 transition-colors">Features</a>
              <a href="#community" className="text-white hover:text-gray-200 transition-colors">Community</a>
              <a href="#support" className="text-white hover:text-gray-200 transition-colors">Support</a>
              <a href="#blog" className="text-white hover:text-gray-200 transition-colors">Blog</a>
              <div className="pt-4 border-t border-white border-opacity-20 flex flex-col space-y-3">
                <SignInButton mode="modal">
                  <button className="w-full px-6 py-2 rounded-xl bg-white bg-opacity-10 text-white font-medium hover:bg-opacity-20 transition-all duration-300">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
                    Sign Up
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
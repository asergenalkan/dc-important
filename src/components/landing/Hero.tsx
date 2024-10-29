import { SignUpButton } from '@clerk/clerk-react';

export default function Hero() {
  return (
    <section className="relative px-4 pt-20 pb-32" id="hero">
      <div className="container mx-auto text-center relative z-10">
        <div className="animate-float">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 mb-8">
            Connect Beyond Limits
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
          Experience the next evolution of community platforms. Where gaming meets creativity, 
          and conversations transform into unforgettable moments.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center max-w-2xl mx-auto">
          <SignUpButton mode="modal">
            <button className="group relative overflow-hidden px-8 py-4 rounded-xl bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <span className="relative text-white text-lg font-medium">Get Started Free</span>
            </button>
          </SignUpButton>
          <a href="#features">
            <button className="group relative overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
              <span className="relative text-white text-lg font-medium">Explore Features</span>
            </button>
          </a>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-40 left-10 animate-float-delay-1">
        <div className="w-20 h-20 rounded-2xl bg-pink-500 bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20"></div>
      </div>
      <div className="absolute top-60 right-20 animate-float-delay-2">
        <div className="w-16 h-16 rounded-full bg-purple-500 bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20"></div>
      </div>
    </section>
  );
}
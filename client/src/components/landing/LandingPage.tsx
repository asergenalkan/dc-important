import LandingNav from './LandingNav';
import Hero from './Hero';
import Features from './Features';
import Community from './Community';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <LandingNav />
      <Hero />
      <Features />
      <Community />
    </div>
  );
}
import { Globe2, Gamepad2, Zap, Shield, Palette, Sparkles } from 'lucide-react';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 hover:bg-opacity-10 transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section className="px-4 py-20 bg-black bg-opacity-30" id="features">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Globe2 className="w-8 h-8 text-pink-400" />}
            title="Global Communities"
            description="Connect with people who share your passions from every corner of the world."
          />
          <FeatureCard 
            icon={<Gamepad2 className="w-8 h-8 text-purple-400" />}
            title="Gaming Integration"
            description="Seamless integration with your favorite games and streaming platforms."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-indigo-400" />}
            title="Lightning Fast"
            description="Experience real-time communication with zero lag and crystal-clear quality."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-green-400" />}
            title="Advanced Security"
            description="State-of-the-art encryption and privacy controls to keep your data safe."
          />
          <FeatureCard 
            icon={<Palette className="w-8 h-8 text-yellow-400" />}
            title="Custom Themes"
            description="Personalize your space with custom themes and unique visual elements."
          />
          <FeatureCard 
            icon={<Sparkles className="w-8 h-8 text-blue-400" />}
            title="Rich Features"
            description="From role management to custom bots, everything you need to build your community."
          />
        </div>
      </div>
    </section>
  );
}
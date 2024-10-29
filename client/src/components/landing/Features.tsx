import { Globe2, Gamepad2, Zap, Shield, Palette, Sparkles } from 'lucide-react';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all duration-200">
      <div className="mb-4 inline-flex p-3 rounded-xl bg-purple-500/10 text-purple-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <section className="py-20 relative" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Powerful Features for Modern Communities
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to build, grow, and manage thriving online communities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Globe2 className="w-6 h-6" />}
            title="Global Communities"
            description="Connect with people who share your passions from every corner of the world."
          />
          <FeatureCard 
            icon={<Gamepad2 className="w-6 h-6" />}
            title="Gaming Integration"
            description="Seamless integration with your favorite games and streaming platforms."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="Lightning Fast"
            description="Experience real-time communication with zero lag and crystal-clear quality."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6" />}
            title="Advanced Security"
            description="State-of-the-art encryption and privacy controls to keep your data safe."
          />
          <FeatureCard 
            icon={<Palette className="w-6 h-6" />}
            title="Custom Themes"
            description="Personalize your space with custom themes and unique visual elements."
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6" />}
            title="Rich Features"
            description="From role management to custom bots, everything you need to build your community."
          />
        </div>
      </div>
    </section>
  );
}
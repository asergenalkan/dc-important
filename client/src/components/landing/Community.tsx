import { SignUpButton } from '@clerk/clerk-react';

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="text-3xl font-bold text-white mb-2">{number}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

export default function Community() {
  return (
    <section className="py-20" id="community">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
          Join Our Growing Community
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard number="10M+" label="Active Users" />
          <StatCard number="500K+" label="Communities" />
          <StatCard number="99.9%" label="Uptime" />
        </div>
        <SignUpButton mode="modal">
          <button className="px-8 py-4 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white font-medium transition-all duration-200">
            Start Building Your Community
          </button>
        </SignUpButton>
      </div>
    </section>
  );
}
import { SignUpButton } from '@clerk/clerk-react';

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10">
      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 mb-2">
        {number}
      </div>
      <div className="text-gray-300">{label}</div>
    </div>
  );
}

export default function Community() {
  return (
    <section className="px-4 py-20" id="community">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Join Our Growing Community
        </h2>
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <StatCard number="10M+" label="Active Users" />
          <StatCard number="500K+" label="Communities" />
          <StatCard number="99.9%" label="Uptime" />
        </div>
        <SignUpButton mode="modal">
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300">
            Start Building Your Community
          </button>
        </SignUpButton>
      </div>
    </section>
  );
}
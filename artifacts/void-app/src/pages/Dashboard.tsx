import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { useUser, useClerk } from "@clerk/react";
import { AsciiBackground } from "@/components/AsciiBackground";

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 md:p-12 relative crt-effect">
      <AsciiBackground />
      
      <header className="flex justify-between items-center mb-16 relative z-10 border-b border-white/10 pb-6">
        <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-70 transition-opacity" data-testid="link-home">
          void.
        </Link>
        <button 
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
          className="text-white/50 hover:text-white transition-colors text-sm font-mono tracking-widest"
          data-testid="button-logout"
        >
          [ DISCONNECT ]
        </button>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full relative z-10">
        <div className="mb-16">
          <GlitchText 
            text={`hello, ${user?.firstName || 'wanderer'}.`} 
            as="h2" 
            className="text-4xl md:text-5xl font-normal mb-4" 
          />
          <p className="text-white/50 font-mono">welcome to the static. what do you need today?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/chat" className="group border border-white/20 bg-black/50 backdrop-blur-md p-8 hover:border-white hover:bg-white/5 transition-all duration-300" data-testid="link-chat">
            <h3 className="text-2xl mb-4 group-hover:tracking-wider transition-all duration-300">&gt; speak</h3>
            <p className="text-white/50 text-sm font-mono leading-relaxed">talk to the void companion. it listens without judgment.</p>
          </Link>
          
          <Link href="/diary" className="group border border-white/20 bg-black/50 backdrop-blur-md p-8 hover:border-white hover:bg-white/5 transition-all duration-300" data-testid="link-diary">
            <h3 className="text-2xl mb-4 group-hover:tracking-wider transition-all duration-300">&gt; write</h3>
            <p className="text-white/50 text-sm font-mono leading-relaxed">your encrypted diary. secure, private, yours alone.</p>
          </Link>
          
          <Link href="/breathe" className="group border border-white/20 bg-black/50 backdrop-blur-md p-8 hover:border-white hover:bg-white/5 transition-all duration-300" data-testid="link-breathe">
            <h3 className="text-2xl mb-4 group-hover:tracking-wider transition-all duration-300">&gt; breathe</h3>
            <p className="text-white/50 text-sm font-mono leading-relaxed">a guided visualization to center yourself in the moment.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

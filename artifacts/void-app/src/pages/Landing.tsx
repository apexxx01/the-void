import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { AsciiBackground } from "@/components/AsciiBackground";
import { useAuth } from "@clerk/react";

export default function Landing() {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden crt-effect">
      <AsciiBackground />
      
      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-2xl mix-blend-difference">
        <GlitchText text="void." as="h1" className="text-6xl md:text-8xl font-bold tracking-tighter mb-6" />
        
        <p className="text-lg md:text-xl text-white/70 mb-12 max-w-lg leading-relaxed font-mono">
          a sanctuary in the static. 
          <br/>speak to the void.
          <br/>it listens.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          {isSignedIn ? (
            <Link 
              href="/dashboard" 
              className="px-8 py-4 border border-white bg-white text-black hover:bg-transparent hover:text-white transition-colors duration-300 font-mono font-bold tracking-widest text-center"
              data-testid="link-enter"
            >
              [ ENTER ]
            </Link>
          ) : (
            <>
              <Link 
                href="/sign-in" 
                className="px-8 py-4 border border-white/50 hover:border-white bg-transparent text-white transition-all duration-300 font-mono tracking-widest text-center"
                data-testid="link-login"
              >
                [ LOGIN ]
              </Link>
              <Link 
                href="/sign-up" 
                className="px-8 py-4 border border-white bg-white text-black hover:bg-transparent hover:text-white transition-all duration-300 font-mono tracking-widest text-center"
                data-testid="link-signup"
              >
                [ REGISTER ]
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

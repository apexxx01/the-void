import { SignIn } from '@clerk/react';
import { AsciiBackground } from '@/components/AsciiBackground';

export default function Login() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 relative crt-effect">
      <AsciiBackground />
      <div className="relative z-10 w-full max-w-[440px]">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

import { SignUp } from '@clerk/react';
import { AsciiBackground } from '@/components/AsciiBackground';

export default function SignUpPage() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 relative crt-effect">
      <AsciiBackground />
      <div className="relative z-10 w-full max-w-[440px]">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

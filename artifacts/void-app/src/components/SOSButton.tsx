import { useState } from 'react';
import { SOSModal } from './SOSModal';

export function SOSButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-white text-black border border-white rounded-none shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-all duration-300 animate-pulse font-mono font-bold text-lg"
        data-testid="button-sos"
        aria-label="SOS"
      >
        SOS
      </button>
      <SOSModal open={open} onOpenChange={setOpen} />
    </>
  );
}

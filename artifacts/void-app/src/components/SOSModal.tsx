import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SOSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SOSModal({ open, onOpenChange }: SOSModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-white/20 text-white rounded-none sm:max-w-md font-mono" data-testid="modal-sos">
        <DialogHeader>
          <DialogTitle className="text-xl glitch" data-text="YOU ARE NOT ALONE">YOU ARE NOT ALONE</DialogTitle>
          <DialogDescription className="text-white/70 pt-4 text-base">
            Please reach out. Someone wants to listen.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-6">
          <div className="flex flex-col gap-2 p-4 border border-white/10 hover:border-white/30 transition-colors">
            <span className="text-sm text-white/50">iCall</span>
            <a href="tel:9152987821" className="text-2xl hover:text-white/80 transition-colors" data-testid="link-call-icall">
              9152987821
            </a>
          </div>
          
          <div className="flex flex-col gap-2 p-4 border border-white/10 hover:border-white/30 transition-colors">
            <span className="text-sm text-white/50">AASRA</span>
            <a href="tel:9820466627" className="text-2xl hover:text-white/80 transition-colors" data-testid="link-call-aasra">
              9820466627
            </a>
          </div>
          
          <div className="flex flex-col gap-2 p-4 border border-white/10 hover:border-white/30 transition-colors">
            <span className="text-sm text-white/50">Vandrevala Foundation</span>
            <a href="tel:1860-2662-345" className="text-2xl hover:text-white/80 transition-colors" data-testid="link-call-vandrevala">
              1860-2662-345
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

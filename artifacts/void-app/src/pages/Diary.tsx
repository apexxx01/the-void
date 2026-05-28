import { useState } from "react";
import { Link } from "wouter";
import { 
  useGetDiaryHasPassword, 
  useSetupDiaryPassword, 
  useVerifyDiaryPassword,
  useListDiaryEntries,
  useCreateDiaryEntry,
  useDeleteDiaryEntry,
  useUpdateDiaryEntry
} from "@workspace/api-client-react";
import { GlitchText } from "@/components/GlitchText";
import { Lock, Unlock, FileText, Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function Diary() {
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  
  const { data: hasPasswordData, isLoading: isLoadingHasPassword } = useGetDiaryHasPassword();
  
  if (isLoadingHasPassword) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>;
  }

  if (!hasPasswordData?.hasPassword) {
    return <DiarySetup />;
  }

  if (!sessionPassword) {
    return <DiaryUnlock onUnlock={setSessionPassword} />;
  }

  return <DiaryView sessionPassword={sessionPassword} />;
}

function DiarySetup() {
  const [pwd, setPwd] = useState("");
  const setup = useSetupDiaryPassword();
  
  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 4) return alert("Password must be at least 4 characters");
    setup.mutate({ data: { password: pwd } }, {
      onSuccess: () => {
        window.location.reload();
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col p-6 crt-effect items-center justify-center">
      <div className="w-full max-w-md border border-white/20 p-8 bg-black/80 backdrop-blur-sm">
        <Link href="/dashboard" className="text-white/50 hover:text-white mb-8 block">&lt; BACK</Link>
        <Lock className="mb-6 opacity-50" size={32} />
        <GlitchText text="initialize diary" as="h2" className="text-2xl mb-2" />
        <p className="text-white/50 text-sm mb-8">your thoughts are encrypted. set a password that only you know. it cannot be recovered if lost.</p>
        
        <form onSubmit={handleSetup} className="space-y-6">
          <div>
            <input 
              type="password" 
              value={pwd} 
              onChange={e => setPwd(e.target.value)} 
              placeholder="encryption key"
              className="w-full bg-transparent border-b border-white/20 p-2 focus:outline-none focus:border-white transition-colors"
              data-testid="input-setup-password"
            />
          </div>
          <button 
            type="submit" 
            disabled={setup.isPending || pwd.length < 4}
            className="w-full py-3 border border-white hover:bg-white hover:text-black transition-colors disabled:opacity-50"
            data-testid="button-setup-password"
          >
            {setup.isPending ? <Loader2 className="animate-spin mx-auto" size={20} /> : "ENCRYPT"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DiaryUnlock({ onUnlock }: { onUnlock: (pwd: string) => void }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const verify = useVerifyDiaryPassword();
  
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    verify.mutate({ data: { password: pwd } }, {
      onSuccess: (res) => {
        if (res.valid) {
          onUnlock(pwd);
        } else {
          setError("invalid key. access denied.");
        }
      },
      onError: () => {
        setError("verification failed.");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col p-6 crt-effect items-center justify-center">
      <div className="w-full max-w-md border border-white/20 p-8 bg-black/80 backdrop-blur-sm">
        <Link href="/dashboard" className="text-white/50 hover:text-white mb-8 block">&lt; BACK</Link>
        <Lock className="mb-6 opacity-50" size={32} />
        <GlitchText text="unlock diary" as="h2" className="text-2xl mb-2" />
        <p className="text-white/50 text-sm mb-8">enter your key to decrypt your sanctuary.</p>
        
        <form onSubmit={handleUnlock} className="space-y-6">
          <div>
            <input 
              type="password" 
              value={pwd} 
              onChange={e => setPwd(e.target.value)} 
              placeholder="encryption key"
              className="w-full bg-transparent border-b border-white/20 p-2 focus:outline-none focus:border-white transition-colors"
              data-testid="input-unlock-password"
            />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
          <button 
            type="submit" 
            disabled={verify.isPending || !pwd}
            className="w-full py-3 border border-white hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
            data-testid="button-unlock"
          >
            {verify.isPending ? <Loader2 className="animate-spin" size={20} /> : <><Unlock size={16} /> DECRYPT</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function DiaryView({ sessionPassword }: { sessionPassword: string }) {
  const { data: entries, refetch, isLoading } = useListDiaryEntries({ request: { headers: { 'x-diary-password': sessionPassword } } });
  const createEntry = useCreateDiaryEntry();
  const deleteEntry = useDeleteDiaryEntry();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    createEntry.mutate({ 
      data: { 
        title: newTitle, 
        content: newContent, 
        diaryPassword: sessionPassword 
      } 
    }, {
      onSuccess: () => {
        setIsCreating(false);
        setNewTitle("");
        setNewContent("");
        refetch();
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this memory forever?")) return;
    deleteEntry.mutate({ id }, {
      onSuccess: () => refetch()
    });
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-mono flex flex-col p-6 crt-effect">
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6 max-w-5xl mx-auto w-full">
        <div>
          <Link href="/dashboard" className="text-white/50 hover:text-white mb-2 block text-sm">&lt; BACK</Link>
          <GlitchText text="void.diary" as="h1" className="text-2xl font-bold tracking-widest" />
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors"
          data-testid="button-new-entry"
        >
          <Plus size={16} /> new memory
        </button>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full">
        {isCreating && (
          <div className="mb-12 p-6 border border-white/20 bg-white/5 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">Record new memory</h3>
              <button onClick={() => setIsCreating(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            <input 
              type="text" 
              placeholder="Title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 p-2 mb-4 focus:outline-none focus:border-white text-lg"
              data-testid="input-entry-title"
            />
            <textarea 
              placeholder="Write your thoughts..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full bg-transparent border border-white/20 p-4 min-h-[200px] mb-4 focus:outline-none focus:border-white resize-y"
              data-testid="input-entry-content"
            />
            <button 
              onClick={handleCreate}
              disabled={createEntry.isPending || !newTitle || !newContent}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black hover:bg-white/80 transition-colors disabled:opacity-50"
              data-testid="button-save-entry"
            >
              {createEntry.isPending ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> SAVE</>}
            </button>
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin opacity-50" /></div>
          ) : entries?.length === 0 ? (
            <div className="col-span-full text-center py-20 text-white/30 border border-white/10 border-dashed">
              no memories recorded yet. the void is empty.
            </div>
          ) : (
            entries?.map(entry => (
              <div key={entry.id} className="border border-white/10 p-6 hover:border-white/30 transition-colors group relative bg-black">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl truncate pr-8">{entry.title}</h3>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-white/50 hover:text-red-400 transition-all"
                    data-testid={`button-delete-entry-${entry.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-xs text-white/40 mb-4">
                  {format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </div>
                {/* Note: The entry list only returns stubs. To view content, we'd need a separate view mode. 
                    For simplicity, we just show the title here and a note that it's encrypted. */}
                <div className="text-white/50 flex items-center gap-2">
                  <Lock size={12} /> encrypted content
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

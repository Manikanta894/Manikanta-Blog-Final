'use client';
import { Share2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function ArticleActions({ title, url }) {
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const save = () => {
    try {
      const key = 'insights_saved_articles';
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (!saved.includes(url)) {
        saved.push(url);
        localStorage.setItem(key, JSON.stringify(saved));
      }
      toast.success('Saved for later');
    } catch {
      toast.error('Could not save — try again');
    }
  };

  return (
    <>
      <button onClick={share} className="flex items-center gap-1.5 hover:text-[#181818]"><Share2 size={12} /> Share</button>
      <button onClick={save} className="flex items-center gap-1.5 hover:text-[#181818]"><Bookmark size={12} /> Save</button>
    </>
  );
}

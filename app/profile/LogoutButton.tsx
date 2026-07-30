'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-sm px-md py-sm w-full rounded-lg text-error hover:bg-error/10 hover:text-error transition-all cursor-pointer"
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
      <span className="font-label-md">Sign Out</span>
    </button>
  );
}

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // user formatting
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfLS8nsdRNX8xue1uEd152hk2PqRNQtc0eFJ-XJq6iBVVdrHVw0cTaJUhfL6ETaMwF9lBmi1FC978XW3APlHBJCg08EsHdIZ6CYbRwQ1gfSxFmR0Jlcg2vynJrspXa19OrnKVOAfVH-SZg1bqIIAsOssmdKa8TmkTzaksQ3dRjdSbJ0FQ1wLUPTo--scB3X9Zscak_4RSDxBQzHPxRvENbVYUrjVFtVpQ4CXAiSehrIdYQ8L6fww4W9TNOjl1L-Dwx67E-wu4KwLEC';
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <main className="flex-grow pt-24 max-w-container-max mx-auto w-full flex flex-col md:flex-row min-h-[calc(100vh-160px)]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-[250px] p-md md:p-lg border-r border-outline-variant/10 bg-surface-container-low/30">
        <nav className="flex flex-col gap-xs sticky top-24">
          <a className="flex items-center gap-sm px-md py-sm rounded-lg bg-primary-container/20 text-primary-container font-bold transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="font-label-md">Account Settings</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">security</span>
            <span className="font-label-md">Security</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">bookmark</span>
            <span className="font-label-md">My Watchlist</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span className="font-label-md">Watch History</span>
          </a>
          <a className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="font-label-md">Support</span>
          </a>
          <div className="mt-8 border-t border-white/10 pt-4">
             <LogoutButton />
          </div>
        </nav>
      </aside>
      
      {/* Main Content Canvas */}
      <section className="flex-grow p-md md:p-lg space-y-xl">
        {/* Header & Profile Info */}
        <div className="space-y-lg animate-in fade-in duration-700">
          <h2 className="font-headline-md text-on-surface">Account Settings</h2>
          <div className="glass-panel p-lg rounded-xl flex flex-col md:flex-row items-center md:items-start gap-lg relative overflow-hidden group">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary-container/20 p-1">
                <img className="w-full h-full object-cover rounded-full" alt="User profile" src={avatarUrl}/>
              </div>
              <button className="absolute bottom-1 right-1 bg-primary-container text-on-primary-container w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
            
            <div className="flex-grow space-y-md text-center md:text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-on-surface-variant font-label-sm uppercase tracking-wider">Username</label>
                  <p className="font-headline-sm text-on-surface">{name}</p>
                </div>
                <div className="space-y-xs">
                  <label className="text-on-surface-variant font-label-sm uppercase tracking-wider">Email Address</label>
                  <p className="font-headline-sm text-on-surface">{user.email}</p>
                </div>
                <div className="space-y-xs">
                  <label className="text-on-surface-variant font-label-sm uppercase tracking-wider">Member Since</label>
                  <p className="font-headline-sm text-on-surface">{joinDate}</p>
                </div>
                <div className="space-y-xs">
                  <label className="text-on-surface-variant font-label-sm uppercase tracking-wider">Plan Status</label>
                  <p className="font-headline-sm text-primary-container flex items-center justify-center md:justify-start gap-xs">
                    Basic Plan
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </p>
                </div>
              </div>
              <div className="pt-base">
                <button className="px-md py-sm bg-transparent border border-primary-container text-primary-container font-label-md rounded-lg hover:bg-primary-container/10 transition-colors cursor-pointer">Edit Profile Information</button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Watchlist Section */}
        <div className="space-y-md">
          <div className="flex justify-between items-end">
            <h3 className="font-headline-sm text-on-surface">Active Watchlist</h3>
            <a className="text-primary-container font-label-sm hover:underline uppercase tracking-widest" href="#">View All</a>
          </div>
          <div className="flex gap-md overflow-x-auto custom-scrollbar pb-md -mx-4 px-4">
            <div className="min-w-[200px] md:min-w-[240px] relative group cursor-pointer aspect-[2/3] overflow-hidden rounded-xl border border-outline-variant/20 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-primary-container/50">
              <img className="w-full h-full object-cover" alt="Stellar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVhhVuLHuJWlVK2xvhc5AS0TXn1eJWxBwy6S90-_eWLCqdwYVYBNLU54MpMLP78uSonwHPLLO5SGKuNVxuidWdWukF72QGcqKyVsZeiOOJrpox_LHXplUbQLGnciT75ZOAvtdV3vUFYWMt-UxvSNIZu_m46N7PSn19RA6wrFkfLqMRjswVMhW3Prn8dnUHd4-jHjkOeRWjO390GkMwT1o8r84Cl5xq2rIvsjkDq3haWBqReMkIDFYzOcQSGQxaGX00Wzu43snR6NQB"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
              <div className="absolute top-2 left-2 bg-primary-container text-on-primary-container px-sm py-xs rounded font-label-sm">TRENDING</div>
              <div className="absolute bottom-0 left-0 right-0 p-md space-y-xs translate-y-2 group-hover:translate-y-0 transition-transform">
                <h4 className="font-label-md text-white">Stellar</h4>
                <div className="flex items-center gap-xs text-[12px] text-on-surface-variant">
                  <span>2024</span> • <span>Sci-Fi</span> • <span className="text-primary-container">9.4</span>
                </div>
              </div>
            </div>
            {/* Movie Card 2 */}
            <div className="min-w-[200px] md:min-w-[240px] relative group cursor-pointer aspect-[2/3] overflow-hidden rounded-xl border border-outline-variant/20 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-primary-container/50">
              <img className="w-full h-full object-cover" alt="Code Red" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdc9yYd68-eFwde8oyjvK7f-AgIMA9KGATwk4nyUAxTuy9eirSIGGUYSXRQ2dRVJIJhna73Q0piaKRHBsJDvK9oMd0iKpg69Eh1fW5L9zBWSA3ZoxokrcvF1wLaBJxvbCUTJvozcthC82Pd8fJfwHlroPZt9vunhBYPB3wOg_L8KCLVRWvaJbnN12wTNnQPbbeuwdPGD03kH_eaJ0a_773nSPOv38Ou3rw2USxBuOBqFot81KOx5XGIQFqlFGf4mNSswRWuXc-1kCS"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 right-0 p-md space-y-xs">
                <h4 className="font-label-md text-white">Code Red</h4>
                <div className="flex items-center gap-xs text-[12px] text-on-surface-variant">
                  <span>2023</span> • <span>Action</span> • <span className="text-primary-container">8.8</span>
                </div>
              </div>
            </div>
            {/* Movie Card 3 */}
            <div className="min-w-[200px] md:min-w-[240px] relative group cursor-pointer aspect-[2/3] overflow-hidden rounded-xl border border-outline-variant/20 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-primary-container/50">
              <img className="w-full h-full object-cover" alt="The Silent Sea" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFQ-XKuBCK2ll-WkUHa-klby4zg_UpIRj1uh0S7_DkbsZoQvPPSiS3Ai-7VE9mxx8ORGF5Y7yMRHd3KeJ33CX9Thrm14V7UppVSELdLvfeYkJnOKg5zZHTiabS5KH7TXFy6ltcnqV50DWnoRAJtgxKqXxl4hjsOcdaIkFIey83xT1tnThZlJv5DRkF8cdUzsudw6mM6LxCVieLg2rZW_PeQJS-fj0yka9vHWtBWT_BccbuLsnyBF0UcLbxHbpCKLDeyYb1csbAeSxW"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 right-0 p-md space-y-xs">
                <h4 className="font-label-md text-white">The Silent Sea</h4>
                <div className="flex items-center gap-xs text-[12px] text-on-surface-variant">
                  <span>2024</span> • <span>Thriller</span> • <span className="text-primary-container">9.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Watched History Section */}
        <div className="space-y-md">
          <div className="flex justify-between items-end">
            <h3 className="font-headline-sm text-on-surface">Recently Watched History</h3>
            <button className="text-on-surface-variant font-label-sm hover:text-primary-container transition-colors uppercase tracking-widest cursor-pointer">Clear History</button>
          </div>
          <div className="flex gap-md overflow-x-auto custom-scrollbar pb-md -mx-4 px-4">
            <div className="min-w-[160px] md:min-w-[200px] group cursor-pointer space-y-sm">
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden border border-outline-variant/20">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Shadow Realm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS3C7JZ_w9BwAVaQe7pH7Ph8P01kUt6p5nTuD-5YZQCoC-itajDUR_JAkTd6zn1B6I-LCOUF6n73j0OkALhkIZXO6BgC8qPPmzgV7BJ8Gr-4aTnsfu_0IjfHjYGzc_605x_8J9tNXNvCKhylh6u8y3ciDpwTkfZaNpDE9SFS_XekUYgANQ3IcPB4TnnG8FRBBBKW49Yo-57byXxYQg2LE2RRVpPXW7m5G5gktSX8dgYsiy3dGWJnjk6tARH6zlx_qy0RLJ-L6GbrQh"/>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-highest">
                  <div className="h-full bg-primary-container" style={{ width: '60%' }}></div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-primary-container text-4xl">play_circle</span>
                </div>
              </div>
              <div className="space-y-xs">
                <p className="font-label-md text-on-surface truncate">Shadow Realm</p>
                <p className="text-[12px] text-on-surface-variant">42m remaining</p>
              </div>
            </div>
            {/* History Item 2 */}
            <div className="min-w-[160px] md:min-w-[200px] group cursor-pointer space-y-sm">
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden border border-outline-variant/20">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Mars Horizon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzLA0v1PiiSZx5IFimUHf96CCxlJ6Ofk0AIPft6FxugGxjf2rGAjzodSvQsL3RphDo2HbiKSVHwca9HD9hojQjThNmO4JM-DyQKu3IFufoy68r4eyyl2v9im5qh5_tBFWOKi1w0nAZhUk0MUwsnHiPKL9G_t-57rQ3eOrTyNne8EZzKgXeWA3DnhAiXLeOWPWa2mRYQm-px28l85jFu1fxPK3DX2FWYt1b2oZm21_1wMI5beKoJ5EusY3rB749YPi4XIeoWNmfUo0R"/>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-highest">
                  <div className="h-full bg-primary-container" style={{ width: '85%' }}></div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-primary-container text-4xl">play_circle</span>
                </div>
              </div>
              <div className="space-y-xs">
                <p className="font-label-md text-on-surface truncate">Mars Horizon</p>
                <p className="text-[12px] text-on-surface-variant">12m remaining</p>
              </div>
            </div>
            {/* History Item 3 */}
            <div className="min-w-[160px] md:min-w-[200px] group cursor-pointer space-y-sm">
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden border border-outline-variant/20">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Velocita" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8EjpOlf5gGEtdF5QzOU_QNVN3gffPv1aGUP1Gkd5BZ3DFlfF6VGIGxPWbZ6mkiMS_DErGlaV5Jx7lr6HiQ_rZnGpbaypoag4vDAsdMDu6VmazeTLRqGSeuyAeXCy2C6LqYtgm_PH-t-hSrjAo9QFH6MIIN_tbH2JtWd0aQLqWOmI2HN_pGdCKzoow1l5edqmWE0ib9X3xCN1DrO2EbX11ByCnWwZfntyY0eQQhWWBEOScw_3XUZLh6iHYu8UTd0fx8B5HdhaQmAHG"/>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-highest">
                  <div className="h-full bg-primary-container" style={{ width: '30%' }}></div>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-primary-container text-4xl">play_circle</span>
                </div>
              </div>
              <div className="space-y-xs">
                <p className="font-label-md text-on-surface truncate">Velocita</p>
                <p className="text-[12px] text-on-surface-variant">1h 15m remaining</p>
              </div>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}

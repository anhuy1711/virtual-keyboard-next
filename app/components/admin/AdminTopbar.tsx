'use client';

export default function AdminTopbar() {
    return (
        <header className="flex justify-between items-center w-[calc(100%-18rem)] px-8 h-16 ml-72 fixed top-0 bg-surface-bright/80 backdrop-blur-xl z-40">
            <div className="flex items-center gap-4">
        <span className="font-headline text-lg font-extrabold text-primary">
          The Digital Atelier
        </span>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative w-80 hidden md:block">
                    <input
                        className="w-full h-10 pl-10 pr-4 bg-surface-container-high border-none rounded-full text-sm focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
                        placeholder="Search..."
                        type="text"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">
            search
          </span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-secondary transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>

                    <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-secondary transition-colors">
                        <span className="material-symbols-outlined">help_outline</span>
                    </button>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        A
                    </div>

                    <div className="hidden lg:block">
                        <p className="text-xs font-bold text-on-surface">Admin Profile</p>
                        <p className="text-[10px] text-on-surface-variant">System Master</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
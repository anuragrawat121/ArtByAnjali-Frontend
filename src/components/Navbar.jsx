import { Link } from 'react-router-dom';
import { Palette, ShieldCheck } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-neutral-900/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
                    <Palette className="text-amber-500" />
                    ArtByAnjali
                </Link>
                
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-neutral-400 hover:text-white transition-colors">Gallery</Link>
                    <Link to="/admin" className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 transition-all text-sm font-medium">
                        <ShieldCheck size={18} className="text-amber-500" />
                        Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

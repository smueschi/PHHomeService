
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-eucalyptus tracking-tight">PH Home Service</span>
                        <span className="text-sm text-slate-400">© 2026</span>
                    </div>

                    <div className="flex gap-8 text-sm font-medium text-slate-500">
                        <Link href="/privacy" className="hover:text-eucalyptus transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-eucalyptus transition-colors">
                            Terms of Service
                        </Link>
                    </div>

                </div>
            </div>
        </footer>
    );
}

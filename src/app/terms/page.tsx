
import { Header } from "@/components/layout/Header";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white">
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-4xl font-black text-eucalyptus mb-8">Terms of Service</h1>
                <div className="prose prose-lg text-slate-600">
                    <p className="mb-6">Last updated: January 3, 2026</p>

                    <p className="mb-6">
                        These Terms of Service ("Terms") govern your use of the PH Home Service platform. By accessing or using our app, you agree to these Terms. If you do not agree, please do not use our services.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Scope of Services</h2>
                    <p className="mb-6">
                        PH Home Service acts as a <strong>marketplace platform</strong> connecting users ("Clients") with independent service professionals ("Providers"). We are not the employer of these Providers. The Service Contract is directly between the Client and the Provider.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. User Responsibilities</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>You must provide accurate location and contact information.</li>
                        <li>You agree to treat Providers with respect and ensure a safe working environment.</li>
                        <li>You must pay the agreed fees for services rendered.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. Bookings and Cancellations</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>Bookings are subject to Provider availability.</li>
                        <li>Cancellations made less than 2 hours before the scheduled time may incur a cancellation fee.</li>
                        <li>We reserve the right to suspend accounts with frequent cancellations or "no-show" incidents.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">4. Liability</h2>
                    <p className="mb-6">
                        While we verify the identity and basic credentials of Providers, PH Home Service is not liable for:
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>Any personal injury or property damage resulting from the service.</li>
                        <li>Matches made outside of our platform.</li>
                        <li>Quality or satisfaction disputes (though we will mediate where possible).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">5. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of the Republic of the Philippines. Any disputes arising from these Terms shall be resolved in the courts of Surigao del Norte.
                    </p>
                </div>
            </main>
        </div>
    );
}

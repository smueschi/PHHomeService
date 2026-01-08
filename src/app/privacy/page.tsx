
import { Header } from "@/components/layout/Header";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white">
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-4xl font-black text-eucalyptus mb-8">Privacy Policy</h1>
                <div className="prose prose-lg text-slate-600">
                    <p className="mb-6">Last updated: January 3, 2026</p>

                    <p className="mb-6">
                        Welcome to PH Home Service ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data in accordance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> of the Philippines.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
                    <p className="mb-4">We collect the following types of information to provide our home services:</p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Personal Identification:</strong> Name, phone number, and home address (for service delivery).</li>
                        <li><strong>Service Data:</strong> Booking history, service preferences, and notes.</li>
                        <li><strong>Technical Data:</strong> IP address and device information for security.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Your Data</h2>
                    <p className="mb-4">Your data is processed for the following purposes:</p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>To connect you with verified service providers (therapists, cleaners, etc.).</li>
                        <li>To process bookings and payments.</li>
                        <li>To send service updates and confirmations via SMS or WhatsApp.</li>
                        <li>To improve our platform and customer service.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">3. Data Sharing</h2>
                    <p className="mb-6">
                        We only share your relevant details (Name, Address, Service Needed) with the specific <strong>Service Provider</strong> you book. We do not sell your data to third parties. We may disclose data if required by Philippine law or legal process.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">4. Your Rights</h2>
                    <p className="mb-4">Under the Data Privacy Act, you have the right to:</p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>Be informed about how your data is processed.</li>
                        <li>Access your personal data.</li>
                        <li>Correct any inaccuracies.</li>
                        <li>Object to processing or request deletion (Right to Erasure).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy or wish to exercise your rights, please contact our Data Protection Officer at <strong>privacy@phhomeservice.com</strong>.
                    </p>
                </div>
            </main>
        </div>
    );
}

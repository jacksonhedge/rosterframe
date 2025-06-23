import { Navigation } from '../components/ui/Navigation';
import { Footer } from '../components/ui/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <Navigation 
        logo="Roster Frame"
        links={[
          { href: '/build-and-buy', label: 'Build & Buy' },
          { href: '/marketplace', label: 'Marketplace' },
          { href: '/collection', label: 'Collection' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="mb-4">
              By accessing or using Roster Frame's website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Roster Frame provides custom fantasy sports plaques and frames. We offer a platform where users can:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Design custom plaques featuring fantasy sports teams</li>
              <li>Select and purchase sports cards for their displays</li>
              <li>Order physical products for delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">
              To use certain features of our service, you may need to create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maintaining the confidentiality of your account information</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Orders and Payment</h2>
            <p className="mb-4">When you place an order:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>You agree to provide accurate and complete information</li>
              <li>You agree to pay all charges incurred</li>
              <li>Prices are subject to change without notice</li>
              <li>Payment processing is handled securely through Stripe</li>
              <li>All sales are final unless otherwise stated</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Product Information</h2>
            <p className="mb-4">
              We strive to display accurate product information, including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Product descriptions and specifications</li>
              <li>Pricing information</li>
              <li>Availability status</li>
            </ul>
            <p className="mb-4">
              However, we do not guarantee that product descriptions or other content is accurate, complete, or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Shipping and Delivery</h2>
            <p className="mb-4">
              Shipping times and costs will be calculated at checkout. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Returns and Refunds</h2>
            <p className="mb-4">
              Due to the custom nature of our products:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>All sales are final for custom plaques</li>
              <li>We will replace items damaged during shipping</li>
              <li>Quality issues must be reported within 14 days of delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Intellectual Property</h2>
            <p className="mb-4">
              All content on this website, including text, graphics, logos, and software, is the property of Roster Frame or its content suppliers and is protected by intellectual property laws.
            </p>
            <p className="mb-4">
              By uploading content to our service, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content for the purpose of providing our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Prohibited Uses</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use our service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper working of our website</li>
              <li>Upload malicious code or viruses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
            <p className="mb-4">
              Our services are provided "as is" and "as available" without any warranties, express or implied. We do not warrant that our services will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, Roster Frame shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify and hold harmless Roster Frame and its affiliates from any claims, losses, liabilities, damages, costs, or expenses arising from your use of our services or violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Governing Law</h2>
            <p className="mb-4">
              These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">14. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the updated terms on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">15. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Roster Frame</p>
              <p>Email: <a href="mailto:jackson@hedgepayments.com" className="text-blue-600 hover:underline">jackson@hedgepayments.com</a></p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
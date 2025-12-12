import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | Esport Shield",
  description: "Cookie Policy for Esport Shield esports tournament platform",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">
              Last updated: December 12, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-invert prose-purple">
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. What Are Cookies?</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Cookies are small text files that are placed on your device (computer, tablet, or mobile) 
                when you visit a website. They are widely used to make websites work more efficiently, 
                provide a better user experience, and give website owners information about how visitors 
                use their site.
              </p>
              <p>
                Cookies can be "persistent" (remaining on your device until you delete them or they expire) 
                or "session" cookies (deleted when you close your browser). They can be "first-party" 
                (set by us) or "third-party" (set by other companies whose services we use).
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Use Cookies</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Esport Shield uses cookies and similar technologies for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To authenticate you and keep you logged in</li>
                <li>To remember your preferences and settings</li>
                <li>To understand how you use our Platform</li>
                <li>To improve our services and user experience</li>
                <li>To provide security features and detect fraud</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Types of Cookies We Use</h2>
            <div className="text-muted-foreground space-y-4">
              
              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.1 Essential Cookies</h3>
              <p>
                These cookies are strictly necessary for the Platform to function properly. They enable 
                core functionality such as security, authentication, and accessibility. You cannot opt 
                out of these cookies.
              </p>
              <div className="bg-card border border-border rounded-lg p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-foreground">Cookie Name</th>
                      <th className="text-left py-2 text-foreground">Purpose</th>
                      <th className="text-left py-2 text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">session_token</td>
                      <td className="py-2">Maintains your login session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">auth_token</td>
                      <td className="py-2">Authenticates your account</td>
                      <td className="py-2">7 days</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">csrf_token</td>
                      <td className="py-2">Prevents cross-site request forgery</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2">cookie_consent</td>
                      <td className="py-2">Remembers your cookie preferences</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.2 Functional Cookies</h3>
              <p>
                These cookies enable enhanced functionality and personalization. They may be set by us or 
                by third-party providers whose services we use.
              </p>
              <div className="bg-card border border-border rounded-lg p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-foreground">Cookie Name</th>
                      <th className="text-left py-2 text-foreground">Purpose</th>
                      <th className="text-left py-2 text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">theme</td>
                      <td className="py-2">Remembers your dark/light mode preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">language</td>
                      <td className="py-2">Stores your language preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2">timezone</td>
                      <td className="py-2">Stores your timezone for match times</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.3 Analytics Cookies</h3>
              <p>
                These cookies help us understand how visitors interact with the Platform by collecting 
                and reporting information anonymously.
              </p>
              <div className="bg-card border border-border rounded-lg p-4 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-foreground">Cookie Name</th>
                      <th className="text-left py-2 text-foreground">Purpose</th>
                      <th className="text-left py-2 text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">_ga</td>
                      <td className="py-2">Google Analytics - distinguishes users</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">_ga_*</td>
                      <td className="py-2">Google Analytics - maintains session state</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="py-2">_gid</td>
                      <td className="py-2">Google Analytics - distinguishes users</td>
                      <td className="py-2">24 hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.4 Third-Party Cookies</h3>
              <p>
                Some cookies are set by third-party services that appear on our pages:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Discord:</strong> When you authenticate with Discord or use Discord integrations</li>
                <li><strong>Google:</strong> When you authenticate with Google or use Google services</li>
                <li><strong>Cloudflare:</strong> Security and performance cookies for DDoS protection</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Similar Technologies</h2>
            <div className="text-muted-foreground space-y-4">
              <p>In addition to cookies, we may use other similar technologies:</p>
              
              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">4.1 Local Storage</h3>
              <p>
                We use browser local storage to store non-sensitive preferences and cache data for better 
                performance. This includes tournament bracket states, UI preferences, and draft content.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">4.2 Session Storage</h3>
              <p>
                Temporary storage that is cleared when you close your browser. Used for form data 
                preservation and temporary state management.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">4.3 Web Beacons</h3>
              <p>
                Small graphic images (also known as pixel tags or clear GIFs) used in emails and on 
                pages to monitor user behavior and collect analytics.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Managing Your Cookie Preferences</h2>
            <div className="text-muted-foreground space-y-4">
              <p>You have several options for managing cookies:</p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.1 Browser Settings</h3>
              <p>
                Most browsers allow you to control cookies through their settings. You can typically:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>See what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close the browser</li>
              </ul>
              <p className="mt-4">Here are links to cookie settings for common browsers:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.2 Opt-Out Tools</h3>
              <p>You can opt out of certain third-party cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out</a></li>
                <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Your Online Choices</a> (EU)</li>
                <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Network Advertising Initiative</a></li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.3 Impact of Disabling Cookies</h3>
              <p>
                Please note that if you disable or block cookies, some features of the Platform may not 
                function properly. You may experience:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Inability to stay logged in</li>
                <li>Loss of preferences (theme, language)</li>
                <li>Some features may not work as expected</li>
                <li>You may need to re-enter information more frequently</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Do Not Track Signals</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Some browsers have a "Do Not Track" (DNT) feature that sends a signal to websites you 
                visit, indicating that you do not wish to be tracked. There is currently no uniform 
                standard for how websites should respond to DNT signals. We currently do not respond 
                to DNT signals, but we honor other privacy preferences you set through our cookie 
                settings.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Updates to This Policy</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for legal, operational, or regulatory reasons. When we make changes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We will update the "Last updated" date at the top of this page</li>
                <li>For significant changes, we may notify you via email or on the Platform</li>
                <li>We encourage you to review this policy periodically</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Contact Us</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> privacy@eshield.live</li>
                <li><strong>Support:</strong> <Link href="/contact" className="text-primary hover:underline">Contact Form</Link></li>
              </ul>
              <p className="mt-4">
                For more information about our data practices, please see our{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

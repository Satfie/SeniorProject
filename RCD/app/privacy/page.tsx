import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Esport Shield",
  description: "Privacy Policy for Esport Shield esports tournament platform",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
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
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Esport Shield ("we," "us," or "our") is committed to protecting your privacy. This Privacy 
                Policy explains how we collect, use, disclose, and safeguard your information when you use 
                our website, mobile applications, and services (collectively, the "Platform").
              </p>
              <p>
                By using the Platform, you consent to the data practices described in this policy. If you 
                do not agree with this policy, please do not access or use our Platform.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
            <div className="text-muted-foreground space-y-4">
              
              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.1 Information You Provide</h3>
              <p>We collect information you voluntarily provide when you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Create an account:</strong> Username, email address, password, and profile information</li>
                <li><strong>Complete your profile:</strong> Display name, avatar, bio, social media links, and gaming profiles</li>
                <li><strong>Participate in tournaments:</strong> Team information, roster details, and competition history</li>
                <li><strong>Contact us:</strong> Name, email, and message content through support forms</li>
                <li><strong>OAuth authentication:</strong> Profile information from Discord or Google when you choose to sign in with these services</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.2 Information Collected Automatically</h3>
              <p>When you access the Platform, we automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Device information:</strong> Device type, operating system, browser type, and version</li>
                <li><strong>Log data:</strong> IP address, access times, pages viewed, and referring URLs</li>
                <li><strong>Usage data:</strong> Features used, actions taken, and time spent on the Platform</li>
                <li><strong>Cookies and tracking:</strong> Data collected through cookies and similar technologies (see our <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.3 Information from Third Parties</h3>
              <p>We may receive information from:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>OAuth providers:</strong> Discord and Google profile data when you authenticate</li>
                <li><strong>Gaming platforms:</strong> Game statistics and rankings when you link accounts</li>
                <li><strong>Partners:</strong> Tournament results and player statistics from affiliated organizations</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
            <div className="text-muted-foreground space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create and manage your account</li>
                <li>Provide, maintain, and improve the Platform</li>
                <li>Process tournament registrations and manage competitions</li>
                <li>Facilitate team creation and roster management</li>
                <li>Display leaderboards, statistics, and player profiles</li>
                <li>Send notifications about tournaments, matches, and team activities</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send administrative emails and important updates</li>
                <li>Personalize your experience and content recommendations</li>
                <li>Analyze usage patterns and improve our services</li>
                <li>Detect, prevent, and address fraud, cheating, and security issues</li>
                <li>Enforce our Terms of Service and tournament rules</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Legal Basis for Processing (GDPR)</h2>
            <div className="text-muted-foreground space-y-4">
              <p>For users in the European Economic Area (EEA), we process your data based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contract performance:</strong> To provide services you've requested (account management, tournament participation)</li>
                <li><strong>Legitimate interests:</strong> To improve our services, prevent fraud, and ensure platform security</li>
                <li><strong>Consent:</strong> For marketing communications and certain cookies (which you can withdraw at any time)</li>
                <li><strong>Legal obligations:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Information Sharing and Disclosure</h2>
            <div className="text-muted-foreground space-y-4">
              <p>We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.1 Public Information</h3>
              <p>
                Certain information is publicly visible on the Platform, including your username, avatar, 
                team memberships, tournament participation, match results, and statistics. This is necessary 
                for the competitive esports experience.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.2 Service Providers</h3>
              <p>
                We share information with third-party vendors who help us operate the Platform, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloud hosting and infrastructure providers</li>
                <li>Email and notification services</li>
                <li>Analytics and performance monitoring tools</li>
                <li>Customer support platforms</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.3 Tournament Organizers</h3>
              <p>
                When you participate in tournaments, your relevant information (username, team, contact info) 
                may be shared with tournament organizers as necessary for event administration.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.4 Legal Requirements</h3>
              <p>We may disclose information when required by law, court order, or government request, or when necessary to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with legal obligations</li>
                <li>Protect our rights and property</li>
                <li>Prevent fraud or illegal activities</li>
                <li>Protect the safety of users or the public</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">5.5 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, user information may be transferred 
                to the acquiring entity. We will notify you of any such change.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Data Retention</h2>
            <div className="text-muted-foreground space-y-4">
              <p>We retain your information for as long as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account remains active</li>
                <li>Necessary to provide our services</li>
                <li>Required by law or for legitimate business purposes</li>
                <li>Needed to resolve disputes and enforce our agreements</li>
              </ul>
              <p>
                After account deletion, we may retain certain information for a limited period to comply with 
                legal obligations, resolve disputes, or prevent fraud. Tournament history and match results may 
                be retained for historical and statistical purposes.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Your Rights and Choices</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Depending on your location, you may have the following rights:</p>
              
              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">7.1 Access and Portability</h3>
              <p>
                You can access your personal data through your account settings. You may request a copy of 
                your data in a portable format.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">7.2 Correction</h3>
              <p>
                You can update most of your information through your account settings. For other corrections, 
                please contact us.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">7.3 Deletion</h3>
              <p>
                You can request deletion of your account and personal data. Note that some information may 
                be retained as described in the Data Retention section.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">7.4 Opt-Out</h3>
              <p>You can opt out of:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Marketing emails via unsubscribe links</li>
                <li>Push notifications via device settings</li>
                <li>Certain cookies via browser settings or our cookie preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">7.5 GDPR Rights (EEA Users)</h3>
              <p>If you are in the EEA, you also have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Object to processing based on legitimate interests</li>
                <li>Restrict processing in certain circumstances</li>
                <li>Withdraw consent at any time (where consent is the legal basis)</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>

              <p className="mt-4">
                To exercise these rights, please contact us at{" "}
                <Link href="mailto:privacy@eshield.live" className="text-primary hover:underline">privacy@eshield.live</Link>.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Data Security</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure password hashing using industry-standard algorithms</li>
                <li>Regular security assessments and vulnerability testing</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. International Data Transfers</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                These countries may have different data protection laws. When we transfer data internationally, 
                we implement appropriate safeguards such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard contractual clauses approved by relevant authorities</li>
                <li>Data processing agreements with service providers</li>
                <li>Compliance with applicable transfer frameworks</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Children's Privacy</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                The Platform is not intended for children under 13 years of age (or the applicable age in 
                your jurisdiction). We do not knowingly collect personal information from children under 13. 
                If we learn that we have collected information from a child under 13, we will delete that 
                information promptly.
              </p>
              <p>
                If you believe we have collected information from a child under 13, please contact us 
                immediately at{" "}
                <Link href="mailto:privacy@eshield.live" className="text-primary hover:underline">privacy@eshield.live</Link>.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Third-Party Links and Services</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                The Platform may contain links to third-party websites, services, or applications. This 
                Privacy Policy does not apply to those third parties. We encourage you to read the privacy 
                policies of any third-party services you access.
              </p>
              <p>
                When you authenticate using Discord or Google, their respective privacy policies apply to 
                the information they collect and share with us.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Changes to This Policy</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the updated policy on this page with a new "Last updated" date</li>
                <li>Sending you an email notification (for material changes)</li>
                <li>Displaying a prominent notice on the Platform</li>
              </ul>
              <p>
                Your continued use of the Platform after any changes indicates your acceptance of the 
                updated Privacy Policy.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Contact Us</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data 
                practices, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Privacy Email:</strong> privacy@eshield.live</li>
                <li><strong>General Support:</strong> <Link href="/contact" className="text-primary hover:underline">Contact Form</Link></li>
                <li><strong>Address:</strong> Manama, Kingdom of Bahrain</li>
              </ul>
              <p className="mt-4">
                For GDPR-related inquiries from EEA residents, we will respond within 30 days.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

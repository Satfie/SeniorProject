import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Esport Shield",
  description: "Terms of Service for Esport Shield esports tournament platform",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Welcome to Esport Shield. By accessing or using our website, mobile applications, and services 
                (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, please do not use our Platform.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and Esport Shield ("we," "us," or "our"). 
                We reserve the right to modify these Terms at any time. We will notify users of significant changes 
                via email or through the Platform. Your continued use of the Platform after such modifications 
                constitutes acceptance of the updated Terms.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Eligibility</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                To use Esport Shield, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 13 years of age (or the minimum age required in your jurisdiction)</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
                <li>Not be prohibited from using the Platform under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
              <p>
                If you are under 18 years of age, you represent that your parent or legal guardian has reviewed 
                and agreed to these Terms on your behalf. Parents and guardians are responsible for monitoring 
                their minor children's use of the Platform.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Account Registration</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                To access certain features of the Platform, you must create an account. When creating an account, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security breaches</li>
              </ul>
              <p>
                You may not share your account credentials with others, create multiple accounts for deceptive purposes, 
                or use another person's account without permission. We reserve the right to suspend or terminate 
                accounts that violate these Terms.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Platform Services</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Esport Shield provides esports tournament management services, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tournament creation, management, and participation</li>
                <li>Team formation and roster management</li>
                <li>Match scheduling and result tracking</li>
                <li>Bracket generation and tournament progression</li>
                <li>Player profiles and statistics</li>
                <li>Communication tools for teams and tournament organizers</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time, 
                with or without notice. We are not liable for any modification, suspension, or discontinuation 
                of the Platform or any part thereof.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. User Conduct</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                When using the Platform, you agree NOT to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Harass, abuse, threaten, or intimidate other users</li>
                <li>Post or transmit harmful, offensive, or inappropriate content</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Cheat, exploit bugs, or use unauthorized third-party software in tournaments</li>
                <li>Manipulate match results or engage in match-fixing</li>
                <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                <li>Interfere with or disrupt the Platform's infrastructure</li>
                <li>Collect or harvest user data without consent</li>
                <li>Use automated systems or bots without our express permission</li>
                <li>Engage in any activity that could damage our reputation or goodwill</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Tournament Rules</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Participation in tournaments is subject to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>These Terms of Service</li>
                <li>Specific tournament rules set by organizers</li>
                <li>Game-specific rules and end-user license agreements</li>
                <li>Fair play and sportsmanship standards</li>
              </ul>
              <p>
                Tournament organizers may establish additional rules, eligibility requirements, and prize 
                distributions. By registering for a tournament, you agree to comply with all applicable rules. 
                Violation of tournament rules may result in disqualification, forfeiture of prizes, and/or 
                account suspension.
              </p>
              <p>
                We do not guarantee any specific outcomes, prizes, or results from tournament participation. 
                Prize distributions are handled by tournament organizers and are subject to their terms.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Intellectual Property</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                The Platform and its content, features, and functionality are owned by Esport Shield and are 
                protected by copyright, trademark, and other intellectual property laws. You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Copy, modify, or distribute Platform content without permission</li>
                <li>Use our trademarks, logos, or branding without written consent</li>
                <li>Reverse engineer, decompile, or disassemble any Platform software</li>
                <li>Remove any copyright or proprietary notices</li>
              </ul>
              <p>
                By posting content on the Platform, you grant us a non-exclusive, worldwide, royalty-free license 
                to use, display, and distribute that content in connection with our services. You retain ownership 
                of your content and are responsible for ensuring you have the right to post it.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Privacy</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by 
                our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which 
                is incorporated into these Terms by reference. By using the Platform, you consent to our data 
                practices as described in the Privacy Policy.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Disclaimers</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
                EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                <li>Warranties that the Platform will be uninterrupted, error-free, or secure</li>
                <li>Warranties regarding the accuracy, reliability, or completeness of any content</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
              <p>
                We do not endorse, guarantee, or assume responsibility for any third-party products, services, 
                or content advertised or offered through the Platform.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Limitation of Liability</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ESPORT SHIELD AND ITS OFFICERS, DIRECTORS, EMPLOYEES, 
                AND AGENTS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>Damages resulting from unauthorized access to or alteration of your data</li>
                <li>Damages resulting from any third-party conduct or content on the Platform</li>
                <li>Damages resulting from any interruption or cessation of services</li>
              </ul>
              <p>
                Our total liability for any claims arising from or relating to these Terms or the Platform 
                shall not exceed the greater of (a) the amount you paid us in the 12 months preceding the 
                claim, or (b) $100 USD.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Indemnification</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                You agree to indemnify, defend, and hold harmless Esport Shield and its officers, directors, 
                employees, agents, and affiliates from and against any claims, liabilities, damages, losses, 
                and expenses (including reasonable attorneys' fees) arising out of or relating to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your content or submissions to the Platform</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Termination</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                We may terminate or suspend your account and access to the Platform immediately, without prior 
                notice or liability, for any reason, including if you breach these Terms. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your right to use the Platform will immediately cease</li>
                <li>You must cease all use of the Platform</li>
                <li>We may delete or archive your account data</li>
                <li>Provisions that should survive termination will remain in effect</li>
              </ul>
              <p>
                You may terminate your account at any time by contacting us at{" "}
                <Link href="/contact" className="text-primary hover:underline">support@eshield.live</Link>.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Governing Law and Disputes</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Kingdom of 
                Bahrain, without regard to its conflict of law provisions. Any disputes arising from these 
                Terms or your use of the Platform shall be resolved through:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Good faith negotiations between the parties</li>
                <li>Mediation, if negotiations fail</li>
                <li>Binding arbitration or litigation in the courts of Bahrain, if mediation fails</li>
              </ol>
              <p>
                You agree to waive any right to a jury trial and to participate in class action lawsuits 
                against Esport Shield.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. General Provisions</h2>
            <div className="text-muted-foreground space-y-4">
              <p><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy and any 
              tournament-specific rules, constitute the entire agreement between you and Esport Shield.</p>
              
              <p><strong>Severability:</strong> If any provision of these Terms is found invalid or unenforceable, 
              the remaining provisions will continue in full force and effect.</p>
              
              <p><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will not 
              be deemed a waiver of such right or provision.</p>
              
              <p><strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written 
              consent. We may assign our rights and obligations without restriction.</p>
              
              <p><strong>Notices:</strong> We may provide notices to you via email, posting on the Platform, or 
              other reasonable means. You may contact us through the methods provided on our Contact page.</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">15. Contact Information</h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> legal@eshield.live</li>
                <li><strong>Support:</strong> <Link href="/contact" className="text-primary hover:underline">Contact Form</Link></li>
                <li><strong>Address:</strong> Manama, Kingdom of Bahrain</li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

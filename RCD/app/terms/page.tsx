import { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, Users, Shield, Trophy, AlertTriangle, Gavel, Globe, Mail, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Terms of Service | Esport Shield",
  description: "Terms of Service for Esport Shield esports tournament platform",
};

const sections = [
  {
    id: "acceptance",
    number: "1",
    title: "Acceptance of Terms",
    icon: FileText,
    content: [
      "Welcome to Esport Shield. By accessing or using our website, mobile applications, and services (collectively, the \"Platform\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, please do not use our Platform.",
      "These Terms constitute a legally binding agreement between you and Esport Shield (\"we,\" \"us,\" or \"our\"). We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Platform. Your continued use of the Platform after such modifications constitutes acceptance of the updated Terms."
    ]
  },
  {
    id: "eligibility",
    number: "2",
    title: "Eligibility",
    icon: Users,
    content: [
      "To use Esport Shield, you must:",
    ],
    list: [
      "Be at least 13 years of age (or the minimum age required in your jurisdiction)",
      "Have the legal capacity to enter into a binding agreement",
      "Not be prohibited from using the Platform under applicable laws",
      "Provide accurate and complete registration information"
    ],
    afterList: "If you are under 18 years of age, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf."
  },
  {
    id: "account",
    number: "3",
    title: "Account Registration",
    icon: Shield,
    content: [
      "To access certain features of the Platform, you must create an account. When creating an account, you agree to:"
    ],
    list: [
      "Provide accurate, current, and complete information",
      "Maintain and promptly update your account information",
      "Keep your password secure and confidential",
      "Accept responsibility for all activities under your account",
      "Notify us immediately of any unauthorized access or security breaches"
    ],
    afterList: "You may not share your account credentials with others, create multiple accounts for deceptive purposes, or use another person's account without permission."
  },
  {
    id: "services",
    number: "4",
    title: "Platform Services",
    icon: Trophy,
    content: [
      "Esport Shield provides esports tournament management services, including but not limited to:"
    ],
    list: [
      "Tournament creation, management, and participation",
      "Team formation and roster management",
      "Match scheduling and result tracking",
      "Bracket generation and tournament progression",
      "Player profiles and statistics",
      "Communication tools for teams and tournament organizers"
    ],
    afterList: "We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time, with or without notice."
  },
  {
    id: "conduct",
    number: "5",
    title: "User Conduct",
    icon: AlertTriangle,
    content: [
      "When using the Platform, you agree NOT to:"
    ],
    list: [
      "Violate any applicable laws, regulations, or third-party rights",
      "Use the Platform for any illegal or unauthorized purpose",
      "Harass, abuse, threaten, or intimidate other users",
      "Post or transmit harmful, offensive, or inappropriate content",
      "Impersonate any person or entity or misrepresent your affiliation",
      "Cheat, exploit bugs, or use unauthorized third-party software in tournaments",
      "Manipulate match results or engage in match-fixing",
      "Attempt to gain unauthorized access to the Platform or other users' accounts",
      "Interfere with or disrupt the Platform's infrastructure"
    ]
  },
  {
    id: "tournaments",
    number: "6",
    title: "Tournament Rules",
    icon: Trophy,
    content: [
      "Participation in tournaments is subject to these Terms of Service, specific tournament rules set by organizers, game-specific rules and end-user license agreements, and fair play and sportsmanship standards.",
      "Tournament organizers may establish additional rules, eligibility requirements, and prize distributions. By registering for a tournament, you agree to comply with all applicable rules. Violation of tournament rules may result in disqualification, forfeiture of prizes, and/or account suspension.",
      "We do not guarantee any specific outcomes, prizes, or results from tournament participation. Prize distributions are handled by tournament organizers and are subject to their terms."
    ]
  },
  {
    id: "ip",
    number: "7",
    title: "Intellectual Property",
    icon: Scale,
    content: [
      "The Platform and its content, features, and functionality are owned by Esport Shield and are protected by copyright, trademark, and other intellectual property laws. You may not:"
    ],
    list: [
      "Copy, modify, or distribute Platform content without permission",
      "Use our trademarks, logos, or branding without written consent",
      "Reverse engineer, decompile, or disassemble any Platform software",
      "Remove any copyright or proprietary notices"
    ],
    afterList: "By posting content on the Platform, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content in connection with our services."
  },
  {
    id: "privacy",
    number: "8",
    title: "Privacy",
    icon: Shield,
    content: [
      "Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to our data practices as described in the Privacy Policy."
    ],
    link: { text: "Read our Privacy Policy", href: "/privacy" }
  },
  {
    id: "disclaimers",
    number: "9",
    title: "Disclaimers",
    icon: AlertTriangle,
    content: [
      "THE PLATFORM IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING:"
    ],
    list: [
      "Implied warranties of merchantability, fitness for a particular purpose, and non-infringement",
      "Warranties that the Platform will be uninterrupted, error-free, or secure",
      "Warranties regarding the accuracy, reliability, or completeness of any content",
      "Warranties that defects will be corrected"
    ]
  },
  {
    id: "liability",
    number: "10",
    title: "Limitation of Liability",
    icon: Gavel,
    content: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, ESPORT SHIELD AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:"
    ],
    list: [
      "Any indirect, incidental, special, consequential, or punitive damages",
      "Loss of profits, data, use, goodwill, or other intangible losses",
      "Damages resulting from unauthorized access to or alteration of your data",
      "Damages resulting from any third-party conduct or content on the Platform"
    ],
    afterList: "Our total liability for any claims arising from or relating to these Terms or the Platform shall not exceed $100 USD."
  },
  {
    id: "indemnification",
    number: "11",
    title: "Indemnification",
    icon: Shield,
    content: [
      "You agree to indemnify, defend, and hold harmless Esport Shield and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses arising out of or relating to your use of the Platform, your violation of these Terms, your violation of any third-party rights, or your content or submissions to the Platform."
    ]
  },
  {
    id: "termination",
    number: "12",
    title: "Termination",
    icon: AlertTriangle,
    content: [
      "We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Platform will immediately cease.",
      "You may terminate your account at any time by contacting us at support@eshield.live."
    ]
  },
  {
    id: "governing",
    number: "13",
    title: "Governing Law",
    icon: Globe,
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of the Kingdom of Bahrain, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Platform shall be resolved through good faith negotiations, mediation if negotiations fail, and binding arbitration or litigation in the courts of Bahrain if mediation fails.",
      "You agree to waive any right to a jury trial and to participate in class action lawsuits against Esport Shield."
    ]
  },
  {
    id: "contact",
    number: "14",
    title: "Contact Information",
    icon: Mail,
    content: [
      "If you have any questions about these Terms of Service, please contact us:"
    ],
    contactInfo: [
      { label: "Email", value: "legal@eshield.live" },
      { label: "Support", value: "Contact Form", href: "/contact" },
      { label: "Address", value: "Manama, Kingdom of Bahrain" }
    ]
  }
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 bg-primary/10 border-primary/20 text-primary">
              <Scale className="w-4 h-4 mr-2" />
              Legal
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Terms of <span className="text-primary">Service</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Please read these terms carefully before using our platform.
            </p>
            
            <p className="text-sm text-muted-foreground">
              Last updated: December 12, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="max-w-4xl mx-auto border-white/10 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Table of Contents</h2>
            <div className="grid md:grid-cols-2 gap-2">
              {sections.map((section) => (
                <Link 
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="text-primary font-medium">{section.number}.</span>
                  {section.title}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} id={section.id} className="border-white/10 bg-card/40 backdrop-blur-sm scroll-mt-24">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-primary font-medium">Section {section.number}</span>
                      <h2 className="text-2xl font-bold">{section.title}</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                    
                    {section.list && (
                      <ul className="space-y-2 ml-4">
                        {section.list.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ChevronRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {section.afterList && (
                      <p>{section.afterList}</p>
                    )}
                    
                    {section.link && (
                      <Link href={section.link.href} className="inline-flex items-center gap-2 text-primary hover:underline mt-2">
                        {section.link.text}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                    
                    {section.contactInfo && (
                      <div className="mt-4 p-4 rounded-xl bg-background/50 space-y-2">
                        {section.contactInfo.map((info, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground w-20">{info.label}:</span>
                            {info.href ? (
                              <Link href={info.href} className="text-primary hover:underline">{info.value}</Link>
                            ) : (
                              <span className="text-foreground">{info.value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

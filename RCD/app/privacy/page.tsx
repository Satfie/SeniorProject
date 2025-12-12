import { Metadata } from "next";
import Link from "next/link";
import { Shield, Database, Eye, Share2, Clock, UserCheck, Lock, Globe, Baby, Link2, RefreshCw, Mail, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Privacy Policy | Esport Shield",
  description: "Privacy Policy for Esport Shield esports tournament platform",
};

const sections = [
  {
    id: "introduction",
    number: "1",
    title: "Introduction",
    icon: Shield,
    content: [
      "Esport Shield (\"we,\" \"us,\" or \"our\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile applications, and services (collectively, the \"Platform\").",
      "By using the Platform, you consent to the data practices described in this policy. If you do not agree with this policy, please do not access or use our Platform."
    ]
  },
  {
    id: "collection",
    number: "2",
    title: "Information We Collect",
    icon: Database,
    content: [],
    subsections: [
      {
        title: "2.1 Information You Provide",
        content: "We collect information you voluntarily provide when you:",
        list: [
          "Create an account: Username, email address, password, and profile information",
          "Complete your profile: Display name, avatar, bio, social media links, and gaming profiles",
          "Participate in tournaments: Team information, roster details, and competition history",
          "Contact us: Name, email, and message content through support forms",
          "OAuth authentication: Profile information from Discord or Google when you choose to sign in with these services"
        ]
      },
      {
        title: "2.2 Information Collected Automatically",
        content: "When you access the Platform, we automatically collect:",
        list: [
          "Device information: Device type, operating system, browser type, and version",
          "Log data: IP address, access times, pages viewed, and referring URLs",
          "Usage data: Features used, actions taken, and time spent on the Platform",
          "Cookies and tracking: Data collected through cookies and similar technologies"
        ]
      },
      {
        title: "2.3 Information from Third Parties",
        content: "We may receive information from:",
        list: [
          "OAuth providers: Discord and Google profile data when you authenticate",
          "Gaming platforms: Game statistics and rankings when you link accounts",
          "Partners: Tournament results and player statistics from affiliated organizations"
        ]
      }
    ]
  },
  {
    id: "usage",
    number: "3",
    title: "How We Use Your Information",
    icon: Eye,
    content: [
      "We use the information we collect to:"
    ],
    list: [
      "Create and manage your account",
      "Provide, maintain, and improve the Platform",
      "Process tournament registrations and manage competitions",
      "Facilitate team creation and roster management",
      "Display leaderboards, statistics, and player profiles",
      "Send notifications about tournaments, matches, and team activities",
      "Respond to your inquiries and provide customer support",
      "Personalize your experience and content recommendations",
      "Analyze usage patterns and improve our services",
      "Detect, prevent, and address fraud, cheating, and security issues",
      "Enforce our Terms of Service and tournament rules",
      "Comply with legal obligations"
    ]
  },
  {
    id: "legal-basis",
    number: "4",
    title: "Legal Basis for Processing (GDPR)",
    icon: Shield,
    content: [
      "For users in the European Economic Area (EEA), we process your data based on:"
    ],
    list: [
      "Contract performance: To provide services you've requested (account management, tournament participation)",
      "Legitimate interests: To improve our services, prevent fraud, and ensure platform security",
      "Consent: For marketing communications and certain cookies (which you can withdraw at any time)",
      "Legal obligations: To comply with applicable laws and regulations"
    ]
  },
  {
    id: "sharing",
    number: "5",
    title: "Information Sharing and Disclosure",
    icon: Share2,
    content: [
      "We may share your information in the following circumstances:"
    ],
    subsections: [
      {
        title: "5.1 Public Information",
        content: "Certain information is publicly visible on the Platform, including your username, avatar, team memberships, tournament participation, match results, and statistics. This is necessary for the competitive esports experience."
      },
      {
        title: "5.2 Service Providers",
        content: "We share information with third-party vendors who help us operate the Platform, including cloud hosting providers, email services, analytics tools, and customer support platforms."
      },
      {
        title: "5.3 Tournament Organizers",
        content: "When you participate in tournaments, your relevant information (username, team, contact info) may be shared with tournament organizers as necessary for event administration."
      },
      {
        title: "5.4 Legal Requirements",
        content: "We may disclose information when required by law, court order, or government request, or when necessary to protect our rights, prevent fraud, or ensure user safety."
      },
      {
        title: "5.5 Business Transfers",
        content: "In the event of a merger, acquisition, or sale of assets, user information may be transferred to the acquiring entity. We will notify you of any such change."
      }
    ]
  },
  {
    id: "retention",
    number: "6",
    title: "Data Retention",
    icon: Clock,
    content: [
      "We retain your information for as long as your account remains active, necessary to provide our services, required by law or for legitimate business purposes, and needed to resolve disputes and enforce our agreements.",
      "After account deletion, we may retain certain information for a limited period to comply with legal obligations, resolve disputes, or prevent fraud. Tournament history and match results may be retained for historical and statistical purposes."
    ]
  },
  {
    id: "rights",
    number: "7",
    title: "Your Rights and Choices",
    icon: UserCheck,
    content: [
      "Depending on your location, you may have the following rights:"
    ],
    subsections: [
      {
        title: "Access and Portability",
        content: "You can access your personal data through your account settings. You may request a copy of your data in a portable format."
      },
      {
        title: "Correction",
        content: "You can update most of your information through your account settings. For other corrections, please contact us."
      },
      {
        title: "Deletion",
        content: "You can request deletion of your account and personal data. Note that some information may be retained as described in the Data Retention section."
      },
      {
        title: "Opt-Out",
        content: "You can opt out of marketing emails via unsubscribe links, push notifications via device settings, and certain cookies via browser settings or our cookie preferences."
      },
      {
        title: "GDPR Rights (EEA Users)",
        content: "If you are in the EEA, you also have the right to object to processing based on legitimate interests, restrict processing in certain circumstances, withdraw consent at any time, and lodge a complaint with a supervisory authority."
      }
    ],
    afterContent: "To exercise these rights, please contact us at privacy@eshield.live."
  },
  {
    id: "security",
    number: "8",
    title: "Data Security",
    icon: Lock,
    content: [
      "We implement appropriate technical and organizational measures to protect your personal information, including:"
    ],
    list: [
      "Encryption of data in transit (TLS/SSL) and at rest",
      "Secure password hashing using industry-standard algorithms",
      "Regular security assessments and vulnerability testing",
      "Access controls and authentication measures",
      "Employee training on data protection practices"
    ],
    afterList: "However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security."
  },
  {
    id: "international",
    number: "9",
    title: "International Data Transfers",
    icon: Globe,
    content: [
      "Your information may be transferred to and processed in countries other than your own. These countries may have different data protection laws. When we transfer data internationally, we implement appropriate safeguards such as standard contractual clauses, data processing agreements with service providers, and compliance with applicable transfer frameworks."
    ]
  },
  {
    id: "children",
    number: "10",
    title: "Children's Privacy",
    icon: Baby,
    content: [
      "The Platform is not intended for children under 13 years of age (or the applicable age in your jurisdiction). We do not knowingly collect personal information from children under 13. If we learn that we have collected information from a child under 13, we will delete that information promptly.",
      "If you believe we have collected information from a child under 13, please contact us immediately at privacy@eshield.live."
    ]
  },
  {
    id: "third-party",
    number: "11",
    title: "Third-Party Links and Services",
    icon: Link2,
    content: [
      "The Platform may contain links to third-party websites, services, or applications. This Privacy Policy does not apply to those third parties. We encourage you to read the privacy policies of any third-party services you access.",
      "When you authenticate using Discord or Google, their respective privacy policies apply to the information they collect and share with us."
    ]
  },
  {
    id: "changes",
    number: "12",
    title: "Changes to This Policy",
    icon: RefreshCw,
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a new \"Last updated\" date, sending you an email notification for material changes, and displaying a prominent notice on the Platform.",
      "Your continued use of the Platform after any changes indicates your acceptance of the updated Privacy Policy."
    ]
  },
  {
    id: "contact",
    number: "13",
    title: "Contact Us",
    icon: Mail,
    content: [
      "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:"
    ],
    contactInfo: [
      { label: "Privacy Email", value: "privacy@eshield.live" },
      { label: "General Support", value: "Contact Form", href: "/contact" },
      { label: "Address", value: "Manama, Kingdom of Bahrain" }
    ],
    afterContent: "For GDPR-related inquiries from EEA residents, we will respond within 30 days."
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-green-500/15 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 bg-green-500/10 border-green-500/20 text-green-400">
              <Shield className="w-4 h-4 mr-2" />
              Your Data, Your Rights
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              We're committed to protecting your privacy and being transparent about how we handle your data.
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
                    
                    {section.subsections && section.subsections.map((sub, idx) => (
                      <div key={idx} className="mt-6 p-4 rounded-xl bg-background/50">
                        <h3 className="font-semibold text-foreground mb-2">{sub.title}</h3>
                        <p className="mb-3">{sub.content}</p>
                        {'list' in sub && sub.list && (
                          <ul className="space-y-2 ml-4">
                            {sub.list.map((item, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <ChevronRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
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
                      <p className="mt-4">{section.afterList}</p>
                    )}
                    
                    {section.afterContent && (
                      <p className="mt-4">{section.afterContent}</p>
                    )}
                    
                    {section.contactInfo && (
                      <div className="mt-4 p-4 rounded-xl bg-background/50 space-y-2">
                        {section.contactInfo.map((info, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground w-28">{info.label}:</span>
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

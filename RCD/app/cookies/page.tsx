import { Metadata } from "next";
import Link from "next/link";
import { Cookie, Info, Settings, BarChart3, Globe, Sliders, Ban, RefreshCw, Mail, ChevronRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Cookie Policy | Esport Shield",
  description: "Cookie Policy for Esport Shield esports tournament platform",
};

const cookieTypes = [
  {
    type: "Essential Cookies",
    description: "Strictly necessary for the Platform to function. Cannot be disabled.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    cookies: [
      { name: "session_token", purpose: "Maintains your login session", duration: "Session" },
      { name: "auth_token", purpose: "Authenticates your account", duration: "7 days" },
      { name: "csrf_token", purpose: "Prevents cross-site request forgery", duration: "Session" },
      { name: "cookie_consent", purpose: "Remembers your cookie preferences", duration: "1 year" }
    ]
  },
  {
    type: "Functional Cookies",
    description: "Enable enhanced functionality and personalization.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    cookies: [
      { name: "theme", purpose: "Remembers your dark/light mode preference", duration: "1 year" },
      { name: "language", purpose: "Stores your language preference", duration: "1 year" },
      { name: "timezone", purpose: "Stores your timezone for match times", duration: "1 year" }
    ]
  },
  {
    type: "Analytics Cookies",
    description: "Help us understand how visitors interact with the Platform.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    cookies: [
      { name: "_ga", purpose: "Google Analytics - distinguishes users", duration: "2 years" },
      { name: "_ga_*", purpose: "Google Analytics - maintains session state", duration: "2 years" },
      { name: "_gid", purpose: "Google Analytics - distinguishes users", duration: "24 hours" }
    ]
  }
];

const sections = [
  {
    id: "what-are-cookies",
    number: "1",
    title: "What Are Cookies?",
    icon: Info,
    content: [
      "Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how visitors use their site.",
      "Cookies can be \"persistent\" (remaining on your device until you delete them or they expire) or \"session\" cookies (deleted when you close your browser). They can be \"first-party\" (set by us) or \"third-party\" (set by other companies whose services we use)."
    ]
  },
  {
    id: "how-we-use",
    number: "2",
    title: "How We Use Cookies",
    icon: Settings,
    content: [
      "Esport Shield uses cookies and similar technologies for the following purposes:"
    ],
    list: [
      "To authenticate you and keep you logged in",
      "To remember your preferences and settings",
      "To understand how you use our Platform",
      "To improve our services and user experience",
      "To provide security features and detect fraud"
    ]
  },
  {
    id: "types",
    number: "3",
    title: "Types of Cookies We Use",
    icon: Cookie,
    content: [
      "We use different types of cookies for various purposes. Below is a detailed breakdown of each type and their specific uses."
    ],
    showCookieTable: true
  },
  {
    id: "third-party",
    number: "4",
    title: "Third-Party Cookies",
    icon: Globe,
    content: [
      "Some cookies are set by third-party services that appear on our pages:"
    ],
    list: [
      "Discord: When you authenticate with Discord or use Discord integrations",
      "Google: When you authenticate with Google or use Google services",
      "Cloudflare: Security and performance cookies for DDoS protection"
    ]
  },
  {
    id: "similar-tech",
    number: "5",
    title: "Similar Technologies",
    icon: BarChart3,
    content: [
      "In addition to cookies, we may use other similar technologies:"
    ],
    subsections: [
      {
        title: "Local Storage",
        content: "We use browser local storage to store non-sensitive preferences and cache data for better performance. This includes tournament bracket states, UI preferences, and draft content."
      },
      {
        title: "Session Storage",
        content: "Temporary storage that is cleared when you close your browser. Used for form data preservation and temporary state management."
      },
      {
        title: "Web Beacons",
        content: "Small graphic images (also known as pixel tags or clear GIFs) used in emails and on pages to monitor user behavior and collect analytics."
      }
    ]
  },
  {
    id: "managing",
    number: "6",
    title: "Managing Your Cookie Preferences",
    icon: Sliders,
    content: [
      "You have several options for managing cookies:"
    ],
    subsections: [
      {
        title: "Browser Settings",
        content: "Most browsers allow you to control cookies through their settings. You can typically see what cookies are stored and delete them individually, block third-party cookies, block all cookies, or delete all cookies when you close the browser."
      },
      {
        title: "Browser Cookie Settings",
        content: "Here are links to cookie settings for common browsers:",
        links: [
          { name: "Google Chrome", url: "https://support.google.com/chrome/answer/95647" },
          { name: "Mozilla Firefox", url: "https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" },
          { name: "Apple Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
          { name: "Microsoft Edge", url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" }
        ]
      },
      {
        title: "Opt-Out Tools",
        content: "You can opt out of certain third-party cookies using these tools:",
        links: [
          { name: "Google Analytics Opt-out", url: "https://tools.google.com/dlpage/gaoptout" },
          { name: "Your Online Choices (EU)", url: "https://www.youronlinechoices.com/" },
          { name: "Network Advertising Initiative", url: "https://optout.networkadvertising.org/" }
        ]
      }
    ]
  },
  {
    id: "impact",
    number: "7",
    title: "Impact of Disabling Cookies",
    icon: Ban,
    content: [
      "Please note that if you disable or block cookies, some features of the Platform may not function properly. You may experience:"
    ],
    list: [
      "Inability to stay logged in",
      "Loss of preferences (theme, language)",
      "Some features may not work as expected",
      "You may need to re-enter information more frequently"
    ]
  },
  {
    id: "dnt",
    number: "8",
    title: "Do Not Track Signals",
    icon: Ban,
    content: [
      "Some browsers have a \"Do Not Track\" (DNT) feature that sends a signal to websites you visit, indicating that you do not wish to be tracked. There is currently no uniform standard for how websites should respond to DNT signals. We currently do not respond to DNT signals, but we honor other privacy preferences you set through our cookie settings."
    ]
  },
  {
    id: "updates",
    number: "9",
    title: "Updates to This Policy",
    icon: RefreshCw,
    content: [
      "We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make changes, we will update the \"Last updated\" date at the top of this page. For significant changes, we may notify you via email or on the Platform."
    ]
  },
  {
    id: "contact",
    number: "10",
    title: "Contact Us",
    icon: Mail,
    content: [
      "If you have questions about our use of cookies or this Cookie Policy, please contact us:"
    ],
    contactInfo: [
      { label: "Email", value: "privacy@eshield.live" },
      { label: "Support", value: "Contact Form", href: "/contact" }
    ],
    link: { text: "View our full Privacy Policy", href: "/privacy" }
  }
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-amber-500/15 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 bg-amber-500/10 border-amber-500/20 text-amber-400">
              <Cookie className="w-4 h-4 mr-2" />
              Transparency
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Cookie <span className="text-primary">Policy</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Learn how we use cookies and similar technologies to improve your experience.
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
                    
                    {section.showCookieTable && (
                      <div className="space-y-6 mt-6">
                        {cookieTypes.map((type, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-background/50">
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`p-2 rounded-lg ${type.bgColor}`}>
                                <Cookie className={`w-4 h-4 ${type.color}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{type.type}</h3>
                                <p className="text-sm">{type.description}</p>
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-2 px-3 font-medium text-foreground">Cookie Name</th>
                                    <th className="text-left py-2 px-3 font-medium text-foreground">Purpose</th>
                                    <th className="text-left py-2 px-3 font-medium text-foreground">Duration</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {type.cookies.map((cookie, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                      <td className="py-2 px-3 font-mono text-xs">{cookie.name}</td>
                                      <td className="py-2 px-3">{cookie.purpose}</td>
                                      <td className="py-2 px-3">{cookie.duration}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
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
                    
                    {section.subsections && section.subsections.map((sub, idx) => (
                      <div key={idx} className="mt-6 p-4 rounded-xl bg-background/50">
                        <h3 className="font-semibold text-foreground mb-2">{sub.title}</h3>
                        <p className="mb-3">{sub.content}</p>
                        {sub.links && (
                          <ul className="space-y-2">
                            {sub.links.map((link, i) => (
                              <li key={i}>
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-primary hover:underline"
                                >
                                  {link.name}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    
                    {section.link && (
                      <Link href={section.link.href} className="inline-flex items-center gap-2 text-primary hover:underline mt-4">
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

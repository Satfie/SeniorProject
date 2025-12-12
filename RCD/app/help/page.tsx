"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight, HelpCircle, Users, Trophy, Shield, Settings, CreditCard, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: HelpCircle,
    description: "New to Esport Shield? Start here.",
    faqs: [
      {
        question: "How do I create an account?",
        answer: "To create an account, click the 'Register' button in the top navigation. You can sign up using your email address or connect with Discord or Google for faster registration. Once registered, you'll have access to join teams and participate in tournaments."
      },
      {
        question: "What is Esport Shield?",
        answer: "Esport Shield is a comprehensive esports tournament management platform. We provide tools for organizing tournaments, managing teams, tracking match results, and building your competitive gaming legacy. Whether you're a casual player or aspiring pro, our platform helps you compete and grow."
      },
      {
        question: "Is Esport Shield free to use?",
        answer: "Yes! Esport Shield is completely free for players and teams. You can create an account, join teams, participate in tournaments, and track your progress without any fees. Tournament organizers may have specific entry requirements for prize pool events."
      },
      {
        question: "How do I verify my account?",
        answer: "After registering, you'll receive a verification email. Click the link in the email to verify your account. If you signed up via Discord or Google, your account is automatically verified. Verification helps us maintain a trusted community."
      }
    ]
  },
  {
    id: "teams",
    title: "Teams",
    icon: Users,
    description: "Learn about team management and joining teams.",
    faqs: [
      {
        question: "How do I create a team?",
        answer: "Navigate to the Teams page and click 'Create Team'. You'll need to provide a team name and optional tag (abbreviation). Once created, you become the team manager with full control over team settings, roster, and tournament registrations."
      },
      {
        question: "How do I join an existing team?",
        answer: "Browse the Teams page to find teams accepting new members. Click on a team to view their profile, then click 'Request to Join'. The team manager or captains will review your request and can approve or decline it."
      },
      {
        question: "What's the difference between Manager and Captain?",
        answer: "The Manager is the team owner with full control, including the ability to delete the team, manage captains, and handle all administrative tasks. Captains are trusted members who can approve join requests and manage the roster, but cannot delete the team or remove the manager."
      },
      {
        question: "How do I leave a team?",
        answer: "Go to My Teams in your dashboard, find the team you want to leave, and click 'Leave Team'. Note that if you're the only manager, you'll need to either transfer ownership or delete the team. Team members can leave at any time."
      },
      {
        question: "Can I be on multiple teams?",
        answer: "Currently, players can only be on one team at a time. This ensures competitive integrity and prevents conflicts during tournaments. If you want to join a different team, you'll need to leave your current team first."
      }
    ]
  },
  {
    id: "tournaments",
    title: "Tournaments",
    icon: Trophy,
    description: "Everything about tournament participation.",
    faqs: [
      {
        question: "How do I register for a tournament?",
        answer: "Find a tournament on the Tournaments page and click 'View Details'. If registration is open and you meet the requirements (team size, etc.), click 'Register Team'. Your team manager or captains can register the team for tournaments."
      },
      {
        question: "What tournament formats are supported?",
        answer: "We currently support Single Elimination brackets, which is the most common format in esports. In single elimination, one loss eliminates you from the tournament. We're working on adding Double Elimination and Round Robin formats."
      },
      {
        question: "How are brackets generated?",
        answer: "When a tournament starts, brackets are automatically generated based on the number of registered teams. Teams are seeded and matched up fairly. The bracket updates in real-time as matches are completed."
      },
      {
        question: "How do I report match results?",
        answer: "Tournament administrators report match results through the bracket interface. If you're a participant, contact the tournament organizer if there's a dispute about results. All match results are logged for transparency."
      },
      {
        question: "What happens if I can't play my scheduled match?",
        answer: "Contact the tournament organizer as soon as possible. Depending on the tournament rules, you may be able to reschedule or you may forfeit the match. Always check the specific tournament rules before registering."
      }
    ]
  },
  {
    id: "account",
    title: "Account & Profile",
    icon: Settings,
    description: "Manage your account settings and profile.",
    faqs: [
      {
        question: "How do I update my profile?",
        answer: "Click on your profile picture in the navigation bar and select 'Profile'. Here you can update your username, avatar, game IDs, social links, and other information. Changes are saved automatically when you click Save."
      },
      {
        question: "How do I change my password?",
        answer: "In your Profile settings, scroll to the Security section. Enter your current password and your new password twice to confirm. If you signed up via OAuth (Discord/Google), you'll need to set a password first to enable email login."
      },
      {
        question: "How do I connect Discord or Google to my account?",
        answer: "Go to your Profile and find the 'Linked Accounts' section. Click 'Connect' next to Discord or Google. You'll be redirected to authorize the connection. Once connected, you can use that method to log in."
      },
      {
        question: "Can I delete my account?",
        answer: "If you need to delete your account, please contact our support team through the Contact Us page. We'll process your request and remove your personal data in accordance with our Privacy Policy. Note that some tournament history may be retained for record-keeping."
      },
      {
        question: "How do I add my game IDs?",
        answer: "In your Profile, navigate to the Game IDs section. Here you can add your usernames/IDs for various games like PlayStation Network, Steam, Riot Games, etc. These help teammates and opponents identify you in-game."
      }
    ]
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: Shield,
    description: "Keep your account safe and understand your data.",
    faqs: [
      {
        question: "How is my data protected?",
        answer: "We use industry-standard encryption for all data transmission (HTTPS/TLS). Passwords are hashed using secure algorithms and never stored in plain text. We regularly audit our security practices to protect your information."
      },
      {
        question: "What data do you collect?",
        answer: "We collect information necessary to provide our services: account details (email, username), profile information you provide, team memberships, and tournament participation. See our Privacy Policy for complete details."
      },
      {
        question: "Do you share my data with third parties?",
        answer: "We do not sell your personal data. We only share data with service providers necessary to operate the platform (hosting, authentication). We may share anonymized statistics but never personally identifiable information."
      },
      {
        question: "How do I report a security issue?",
        answer: "If you discover a security vulnerability, please report it through our Contact Us page with 'Security' in the subject. We take all reports seriously and will respond promptly. Please do not publicly disclose vulnerabilities."
      }
    ]
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter FAQs based on search query
  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0 || searchQuery === "");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              How can we help you?
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Search our knowledge base or browse categories below
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-background/60 backdrop-blur border-white/10 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Category Cards */}
        {!searchQuery && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id}
                  className="bg-card/60 backdrop-blur border-white/10 hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.faqs.length} articles</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {filteredCategories.map((category) => (
            <div key={category.id} className="mb-8">
              {(searchQuery || selectedCategory === category.id || selectedCategory === null) && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <category.icon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">{category.title}</h2>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category.id}-${index}`}
                        className="border border-white/10 rounded-lg px-4 bg-card/40 backdrop-blur"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </>
              )}
            </div>
          ))}

          {searchQuery && filteredCategories.every(c => c.faqs.length === 0) && (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any articles matching "{searchQuery}"
              </p>
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear search
              </Button>
            </div>
          )}
        </div>

        {/* Still need help? */}
        <div className="max-w-4xl mx-auto mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-white/10 text-center">
          <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

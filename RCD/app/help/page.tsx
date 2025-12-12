"use client";

import { useState } from "react";
import { Search, HelpCircle, Users, Trophy, Shield, Settings, MessageSquare, ChevronRight, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AnimatedSection } from "@/components/ui/animated-section";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: HelpCircle,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
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
    color: "text-green-400",
    bgColor: "bg-green-500/10",
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
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
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
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
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
    color: "text-red-400",
    bgColor: "bg-red-500/10",
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

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0 || searchQuery === "");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Consistent with other pages */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        
        {/* Floating Orbs - Consistent with home page */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 bg-primary/10 border-primary/20 text-primary">
                <BookOpen className="w-4 h-4 mr-2" />
                Help Center
              </Badge>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                How can we <span className="text-primary">help</span> you?
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Search our knowledge base or browse categories below to find answers to your questions.
              </p>
            </AnimatedSection>
            
            {/* Search Bar */}
            <AnimatedSection delay={300}>
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 h-14 text-lg bg-card/50 backdrop-blur-sm border-white/10 focus:border-primary/50 rounded-xl shadow-lg"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        {/* Category Cards */}
        {!searchQuery && (
          <AnimatedSection delay={400}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16">
              {categories.map((category, index) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <Card 
                    key={category.id}
                    className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 ${
                      isSelected 
                        ? 'border-primary/50 bg-primary/5' 
                        : 'border-white/10 bg-card/40 backdrop-blur-sm hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 rounded-xl ${category.bgColor} flex items-center justify-center mx-auto mb-4 transition-transform ${isSelected ? 'scale-110' : ''}`}>
                        <Icon className={`w-7 h-7 ${category.color}`} />
                      </div>
                      <h3 className="font-semibold mb-1">{category.title}</h3>
                      <p className="text-xs text-muted-foreground">{category.faqs.length} articles</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AnimatedSection>
        )}

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {filteredCategories.map((category) => (
            <div key={category.id} className="mb-10">
              {(searchQuery || selectedCategory === category.id || selectedCategory === null) && (
                <AnimatedSection>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${category.bgColor}`}>
                      <category.icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                    <Badge variant="outline" className="ml-auto border-white/10">
                      {category.faqs.length} {category.faqs.length === 1 ? 'article' : 'articles'}
                    </Badge>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-3">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category.id}-${index}`}
                        className="border border-white/10 rounded-xl px-6 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors data-[state=open]:bg-card/60 data-[state=open]:border-primary/30"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-5 [&[data-state=open]>svg]:rotate-90">
                          <span className="font-medium pr-4">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AnimatedSection>
              )}
            </div>
          ))}

          {searchQuery && filteredCategories.every(c => c.faqs.length === 0) && (
            <AnimatedSection>
              <Card className="border-dashed border-2 border-white/10 bg-card/30">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                    <HelpCircle className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    We couldn't find any articles matching "<span className="text-foreground">{searchQuery}</span>"
                  </p>
                  <Button onClick={() => setSearchQuery("")} variant="outline" className="border-white/10">
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </div>

        {/* Still need help CTA */}
        <AnimatedSection delay={100}>
          <Card className="max-w-4xl mx-auto mt-16 border-white/10 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 overflow-hidden">
            <CardContent className="p-10 text-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Still need help?</h3>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Can't find what you're looking for? Our support team is ready to assist you.
                </p>
                <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                  <Link href="/contact">
                    Contact Support
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
}

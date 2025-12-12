"use client";

import { useState } from "react";
import { Mail, MessageSquare, Clock, MapPin, Send, CheckCircle, Headphones, FileText, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { AnimatedSection } from "@/components/ui/animated-section";

export default function ContactPage() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setFormState("success");
    setFormData({ name: "", email: "", subject: "", category: "", message: "" });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "support@eshield.live",
      subtext: "For general inquiries",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Clock,
      title: "Response Time",
      description: "24-48 hours",
      subtext: "During business days",
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      icon: MapPin,
      title: "Location",
      description: "Manama, Bahrain",
      subtext: "Middle East",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 bg-primary/10 border-primary/20 text-primary">
                <Headphones className="w-4 h-4 mr-2" />
                Support
              </Badge>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Get in <span className="text-primary">Touch</span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have a question or need assistance? We're here to help you succeed in your competitive journey.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        {/* Contact Methods Cards */}
        <AnimatedSection delay={300}>
          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="border-white/10 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-xl ${method.bgColor} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-7 h-7 ${method.color}`} />
                    </div>
                    <h3 className="font-semibold mb-1">{method.title}</h3>
                    <p className="text-foreground font-medium">{method.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{method.subtext}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection delay={400}>
              <Card className="border-white/10 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                  <CardDescription>Find answers faster</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link 
                    href="/help" 
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">Help Center</p>
                      <p className="text-xs text-muted-foreground">Browse FAQs</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/terms" 
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">Terms of Service</p>
                      <p className="text-xs text-muted-foreground">Platform rules</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/privacy" 
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Shield className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">Privacy Policy</p>
                      <p className="text-xs text-muted-foreground">Your data rights</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={500}>
              <Card className="border-white/10 bg-gradient-to-br from-primary/10 to-purple-500/10">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Direct Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For urgent matters, you can reach us directly via email.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">General:</span> info@eshield.live</p>
                    <p><span className="text-muted-foreground">Support:</span> support@eshield.live</p>
                    <p><span className="text-muted-foreground">Legal:</span> legal@eshield.live</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <AnimatedSection delay={400}>
              <Card className="border-white/10 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {formState === "success" ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Message Sent!</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Thank you for reaching out. We'll get back to you within 24-48 hours.
                      </p>
                      <Button onClick={() => setFormState("idle")} variant="outline" className="border-white/10">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name *</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                            className="bg-background/50 border-white/10 focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            required
                            className="bg-background/50 border-white/10 focus:border-primary/50"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select value={formData.category} onValueChange={(v) => handleChange("category", v)} required>
                            <SelectTrigger className="bg-background/50 border-white/10 focus:border-primary/50">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="support">Technical Support</SelectItem>
                              <SelectItem value="account">Account Issues</SelectItem>
                              <SelectItem value="tournament">Tournament Questions</SelectItem>
                              <SelectItem value="team">Team Management</SelectItem>
                              <SelectItem value="bug">Bug Report</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                              <SelectItem value="partnership">Partnership / Business</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            placeholder="Brief description"
                            value={formData.subject}
                            onChange={(e) => handleChange("subject", e.target.value)}
                            required
                            className="bg-background/50 border-white/10 focus:border-primary/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Please describe your question or issue in detail..."
                          value={formData.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          required
                          className="bg-background/50 border-white/10 focus:border-primary/50 min-h-[160px] resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                          * Required fields
                        </p>
                        <Button 
                          type="submit" 
                          disabled={formState === "submitting"}
                          className="shadow-lg shadow-primary/20"
                        >
                          {formState === "submitting" ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
}

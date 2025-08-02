import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  Upload, 
  Download, 
  Mail, 
  Palette, 
  Shield, 
  Zap, 
  Star,
  Check,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import { useState } from "react";

const Index = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI-Powered Extraction",
      description: "Upload any file and let AI automatically extract invoice data",
      free: true
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: "Instant PDF Download",
      description: "Generate professional PDF invoices in seconds",
      free: true
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Premium Templates",
      description: "Access beautiful, customizable invoice templates",
      free: false
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email & Send",
      description: "Send invoices directly to clients via email",
      free: false
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Recurring Invoices",
      description: "Set up automatic recurring invoice reminders",
      free: false
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Save & Manage",
      description: "Store invoices securely in your account",
      free: false
    }
  ];

  const stats = [
    { number: "50K+", label: "Invoices Created" },
    { number: "15K+", label: "Happy Users" },
    { number: "99%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Navigation */}
      <nav className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EaseInvoice
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/templates">
                <Button variant="ghost" size="sm">Templates</Button>
              </Link>
              {!user ? (
                <Link to="/auth">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
              )}
              <Link to="/create">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Create Invoice
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <Link to="/templates" className="block">
                <Button variant="ghost" className="w-full justify-start text-base">
                  <Palette className="h-5 w-5 mr-3" />
                  Templates
                </Button>
              </Link>
              {!user ? (
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full justify-start text-base">
                    Sign In with Google
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start text-base">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Link to="/create" className="block">
                <Button className="w-full bg-gradient-to-r from-primary to-accent text-base py-6">
                  Create Invoice Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile-First Hero Section */}
      <section className="pt-8 pb-16 px-4 bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 text-sm px-4 py-2">
            <Star className="h-4 w-4 mr-2" />
            Free • No Credit Card • Instant Download
          </Badge>

          {/* Main Heading - Mobile Optimized */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Professional Invoices
            </span>
            <br />
            <span className="text-foreground">in Seconds</span>
          </h1>

          {/* Subheading - Mobile Optimized */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload any file, let AI extract the data, and download professional PDFs instantly. 
            <span className="text-accent font-medium"> No registration required.</span>
          </p>

          {/* Primary CTA - Mobile-First */}
          <div className="flex flex-col gap-4 mb-12 max-w-md mx-auto">
            <Link to="/create" className="block">
              <Button size="lg" className="w-full text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg">
                <Upload className="h-6 w-6 mr-3" />
                Create Invoice Now
              </Button>
            </Link>
              <Link to="/templates" className="block">
                <Button variant="outline" size="lg" className="w-full text-base px-6 py-4">
                  <Palette className="h-5 w-5 mr-2" />
                  View Templates
                </Button>
              </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trust Indicators - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              <span className="font-medium">Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              <span className="font-medium">AI-powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              <span className="font-medium">Instant PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile-First */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Free vs Advanced Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start for free, upgrade when you need advanced features
            </p>
          </div>
          
          {/* Features Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                {/* Feature Status Badge */}
                <div className="absolute top-4 right-4">
                  {feature.free ? (
                    <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                      FREE
                    </Badge>
                  ) : (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      ADVANCED
                    </Badge>
                  )}
                </div>

                {/* Icon */}
                <div className={`mb-4 ${feature.free ? 'text-accent' : 'text-primary'}`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">{feature.description}</p>

                {/* Premium Lock Indicator */}
                {!feature.free && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                    <Shield className="h-4 w-4" />
                    <span>Sign in to unlock</span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* CTA for Advanced Features */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Want access to beautiful templates, email sending, and recurring invoices?
            </p>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-base px-8 py-4">
                Sign In with Google - It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile-Optimized CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Professional Invoices?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Join <span className="font-semibold text-accent">15,000+ businesses</span> who trust EaseInvoice 
              for their billing needs. Start free, upgrade when you need more.
            </p>

            {/* Mobile-First CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link to="/create" className="flex-1">
                <Button size="lg" className="w-full text-lg px-6 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
              <Link to="/auth" className="flex-1">
                <Button variant="outline" size="lg" className="w-full text-base px-6 py-6">
                  Unlock Advanced
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>15,000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>50,000+ invoices created</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-current text-amber-500" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-Optimized Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EaseInvoice
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/create" className="text-muted-foreground hover:text-primary transition-colors">
                Create Invoice
              </Link>
              <Link to="/templates" className="text-muted-foreground hover:text-primary transition-colors">
                Templates
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © 2024 EaseInvoice. Making invoicing effortless for everyone.
            </div>
          </div>
        </div>
      </footer>

      {/* Updated Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "EaseInvoice - Professional Invoice Generator",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Create professional invoices instantly with AI-powered data extraction. Free invoice generator with premium templates, email sending, and recurring invoices. No registration required for basic features.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "featureList": [
              "AI-powered data extraction from files",
              "Professional invoice templates",
              "Instant PDF download",
              "Email integration",
              "Recurring invoice reminders",
              "Mobile-first design",
              "Secure and private"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1247"
            }
          })
        }}
      />
    </div>
  );
};

export default Index;

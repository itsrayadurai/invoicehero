import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
  ArrowRight
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Professional Templates",
      description: "Choose from modern, classic, and colorful invoice designs"
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Smart File Upload",
      description: "Upload PDFs, images, or documents to auto-extract invoice data"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "PDF Download",
      description: "Generate and download professional PDF invoices instantly"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Integration",
      description: "Send invoices directly to your clients via email"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data is secure and never shared with third parties"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Create professional invoices in under 2 minutes"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Invoice Generator</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/templates">
                <Button variant="outline">Templates</Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/create">
                <Button>Create Invoice</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Star className="h-3 w-3 mr-1" />
            Free to use • No credit card required
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Professional Invoices in Minutes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The easiest way to generate professional invoices. Upload files to auto-extract data, 
            choose from beautiful templates, and download as PDF instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/create">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Creating
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Palette className="h-5 w-5 mr-2" />
                View Templates
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              No signup required
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              100% Free basic features
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              Professional PDF output
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to create perfect invoices
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From smart data extraction to professional templates, we've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-border/50">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to create your first invoice?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who trust our invoice generator for their billing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button size="lg" className="text-lg px-8 py-6">
                Create Invoice Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Sign up for Premium Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-semibold">Invoice Generator</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Invoice Generator. Create professional invoices with ease.
            </div>
          </div>
        </div>
      </footer>

      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Invoice Generator",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "description": "Create professional invoices instantly with our free online invoice generator. Upload files to auto-extract data, download as PDF, and access premium templates.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "featureList": [
              "Professional invoice templates",
              "File upload and data extraction",
              "PDF download",
              "Email integration",
              "Secure and private"
            ]
          })
        }}
      />
    </div>
  );
};

export default Index;

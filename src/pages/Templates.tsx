import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Templates = () => {
  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean and contemporary design with bold typography",
      preview: "/templates/modern-preview.png",
      isPremium: false,
      color: "template-modern"
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional business invoice layout",
      preview: "/templates/classic-preview.png", 
      isPremium: true,
      color: "template-classic"
    },
    {
      id: "colorful",
      name: "Colorful",
      description: "Vibrant and creative design for creative businesses",
      preview: "/templates/colorful-preview.png",
      isPremium: true,
      color: "template-colorful"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold">Invoice Templates</h1>
                <p className="text-muted-foreground">Choose from professional invoice designs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                {/* Template Preview Placeholder */}
                <div className={`h-full w-full bg-gradient-to-br from-${template.color} to-${template.color}/80 flex items-center justify-center`}>
                  <div className="text-white text-lg font-semibold">
                    {template.name} Template
                  </div>
                </div>
                {template.isPremium && (
                  <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button variant="secondary" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                {template.isPremium ? (
                  <Link to="/auth">
                    <Button className="w-full">
                      Sign up to use
                    </Button>
                  </Link>
                ) : (
                  <Link to="/create">
                    <Button variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;
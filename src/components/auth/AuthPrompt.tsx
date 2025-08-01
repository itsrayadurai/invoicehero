import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetClose,
} from "@/components/ui/bottom-sheet";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Mail, 
  FileText, 
  Clock, 
  Save,
  Star,
  X,
  ArrowRight
} from "lucide-react";

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export const AuthPrompt = ({ isOpen, onClose, feature = "premium" }: AuthPromptProps) => {
  const premiumFeatures = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Premium Templates",
      description: "Access beautiful, professional invoice templates"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email Integration",
      description: "Send invoices directly to clients via email"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Recurring Invoices",
      description: "Set up automatic recurring invoice reminders"
    },
    {
      icon: <Save className="h-5 w-5" />,
      title: "Save & Manage",
      description: "Store invoices securely in your account"
    }
  ];

  return (
    <BottomSheet open={isOpen} onOpenChange={onClose}>
      <BottomSheetContent className="max-h-[85vh]">
        <BottomSheetHeader>
          <div className="flex items-center justify-between">
            <BottomSheetTitle className="text-2xl">
              Unlock Premium Features
            </BottomSheetTitle>
            <BottomSheetClose asChild>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </BottomSheetClose>
          </div>
          <BottomSheetDescription className="text-left">
            Sign in with Google or Apple to access advanced invoice features
          </BottomSheetDescription>
        </BottomSheetHeader>

        <div className="px-4 pb-6 space-y-6">
          {/* Current Feature Highlight */}
          {feature && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <Badge className="bg-primary/10 text-primary">Premium Feature</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                You're trying to access a premium feature. Sign in to unlock it!
              </p>
            </Card>
          )}

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              What you'll get:
            </h4>
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="text-primary mt-0.5">{feature.icon}</div>
                <div>
                  <h5 className="font-medium text-sm">{feature.title}</h5>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 py-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3" />
              <span>Free to sign up</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>30 sec setup</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link to="/auth" className="block">
              <Button size="lg" className="w-full bg-gradient-to-r from-primary to-accent text-white">
                <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google" 
                  className="h-5 w-5 mr-3 bg-white rounded p-1"
                />
                Continue with Google
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="w-full">
              <span className="mr-3">🍎</span>
              Continue with Apple
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
              Continue with Free Features
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy. 
            No spam, ever.
          </p>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
};
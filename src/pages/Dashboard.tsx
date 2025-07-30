import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Eye, Download, Trash } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock invoice data
  const invoices = [
    {
      id: "1",
      number: "INV-001",
      client: "Acme Corp",
      amount: 1500,
      status: "paid",
      date: "2024-01-15"
    },
    {
      id: "2", 
      number: "INV-002",
      client: "Tech Solutions",
      amount: 2300,
      status: "pending",
      date: "2024-01-20"
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
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-muted-foreground">Manage your invoices</p>
              </div>
            </div>
            <Link to="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Invoices</h3>
            <p className="text-3xl font-bold text-primary">{invoices.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Amount</h3>
            <p className="text-3xl font-bold text-accent">
              ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Pending</h3>
            <p className="text-3xl font-bold text-destructive">
              {invoices.filter(inv => inv.status === 'pending').length}
            </p>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.client}</p>
                    </div>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
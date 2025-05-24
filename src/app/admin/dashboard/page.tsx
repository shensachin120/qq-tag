
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode as QrCodeIcon, Search, Printer, PlusCircle, ListFilter } from "lucide-react";
import type { QrCode, QrBatch, QrCodePrintSize } from "@/types";
import { mockQrCodes, mockQrBatches } from "@/types"; // Using mock data
import { useToast } from "@/hooks/use-toast";
import { APP_DOMAIN } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// Mock functions
async function fetchAllQrCodes(): Promise<QrCode[]> {
  return new Promise(resolve => setTimeout(() => resolve([...mockQrCodes]), 500));
}

async function fetchAllBatches(): Promise<QrBatch[]> {
  return new Promise(resolve => setTimeout(() => resolve([...mockQrBatches]), 500));
}

let nextQrNumericId = mockQrCodes.length + 1;
async function generateBatch(count: number): Promise<QrBatch> {
  const newBatchId = `batch${mockQrBatches.length + 1}`;
  const batchName = `Batch ${new Date().toISOString().slice(0,10)}-${String.fromCharCode(65 + mockQrBatches.length % 26)}`;
  const newQrs: QrCode[] = [];
  const startNumericId = nextQrNumericId;

  for (let i = 0; i < count; i++) {
    const uniqueId = `SF${String(nextQrNumericId++).padStart(6, '0')}`;
    newQrs.push({
      id: `qr${uniqueId}`,
      uniqueId,
      status: "unclaimed",
      batchId: newBatchId,
      createdAt: new Date().toISOString(),
    });
  }
  mockQrCodes.push(...newQrs);
  
  const newBatch: QrBatch = {
    id: newBatchId,
    name: batchName,
    count,
    startId: `SF${String(startNumericId).padStart(6, '0')}`,
    endId: `SF${String(nextQrNumericId - 1).padStart(6, '0')}`,
    createdAt: new Date().toISOString(),
  };
  mockQrBatches.push(newBatch);
  return new Promise(resolve => setTimeout(() => resolve(newBatch), 500));
}


export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allQrs, setAllQrs] = useState<QrCode[]>([]);
  const [filteredQrs, setFilteredQrs] = useState<QrCode[]>([]);
  const [batches, setBatches] = useState<QrBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [batchSize, setBatchSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [printSize, setPrintSize] = useState<QrCodePrintSize>("medium");
  const [selectedQrForPrint, setSelectedQrForPrint] = useState<QrCode | null>(null);
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState<QrBatch | null>(null);


  useEffect(() => {
    const checkAuth = () => {
      if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        router.push('/auth/signin?redirect=/admin/dashboard'); // Redirect to user signin
      }
    };
    checkAuth();

    async function loadData() {
      setIsLoading(true);
      const [qrs, bchs] = await Promise.all([fetchAllQrCodes(), fetchAllBatches()]);
      setAllQrs(qrs);
      setFilteredQrs(qrs);
      setBatches(bchs);
      setIsLoading(false);
    }
    loadData();
  }, [router]);

  useEffect(() => {
    const results = allQrs.filter(qr => 
      qr.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (qr.ownerId && qr.ownerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      qr.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQrs(results);
  }, [searchTerm, allQrs]);

  const handleGenerateBatch = async () => {
    if (batchSize <= 0) {
      toast({ title: "Invalid Size", description: "Batch size must be greater than 0.", variant: "destructive" });
      return;
    }
    try {
      setIsLoading(true);
      const newBatch = await generateBatch(batchSize);
      const updatedBatches = await fetchAllBatches(); 
      setBatches(updatedBatches);
      
      const updatedQrs = await fetchAllQrCodes(); 
      setAllQrs(updatedQrs);
      toast({ title: "Batch Generated", description: `${newBatch.count} QR codes (ID: ${newBatch.startId} to ${newBatch.endId}) created in batch ${newBatch.name}.` });
    } catch (error) {
      toast({ title: "Batch Generation Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrintQr = (qr: QrCode) => {
    setSelectedQrForPrint(qr);
    setSelectedBatchForPrint(null); 
  };

  const handlePrintBatch = (batch: QrBatch) => {
     setSelectedBatchForPrint(batch);
     setSelectedQrForPrint(null);
  };
  
  const getPixelSizeForPrintSize = (size: QrCodePrintSize): number => {
    switch (size) {
      case "small": return 100;
      case "medium": return 150; 
      case "large": return 200;
      case "x-large": return 250;
      case "xx-large": return 300;
      default: return 150;
    }
  };

  const confirmPrint = async () => {
    const qrDomain = APP_DOMAIN || 'https://stickerfind.example.com'; 
    const pixelSize = getPixelSizeForPrintSize(printSize);
    let qrsToPrint: QrCode[] = [];
    let pageTitle = "Print QR Codes";

    if (selectedQrForPrint) {
      qrsToPrint = [selectedQrForPrint];
      pageTitle = `Print QR Code: ${selectedQrForPrint.uniqueId}`;
    } else if (selectedBatchForPrint) {
      qrsToPrint = allQrs.filter(qr => qr.batchId === selectedBatchForPrint.id && qr.status !== 'deleted');
      pageTitle = `Print Batch: ${selectedBatchForPrint.name}`;
    }

    if (qrsToPrint.length > 0) {
      let printHtml = `
        <html>
          <head>
            <title>${pageTitle} - Size: ${printSize}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background-color: #fff; display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: flex-start; }
              .qr-print-item { 
                page-break-inside: avoid; 
                display: inline-flex; 
                flex-direction: column;
                align-items: center;
                margin: 15px; 
                text-align: center; 
              }
              .sticker-body {
                background-color: #000000; /* Black background */
                color: #FFFFFF; /* White text */
                padding: 20px; /* Padding around QR and text */
                border-radius: 12px; /* Rounded corners */
                display: flex;
                flex-direction: column;
                align-items: center;
                width: ${pixelSize + 40}px; /* Adjust width based on QR size + padding */
                box-sizing: border-box;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              }
              .sticker-body img { 
                display: block; 
                margin-bottom: 10px; /* Space between QR and text */
                border-radius: 6px; /* Slightly round corners of the QR image itself if needed */
              }
              .sticker-text { 
                font-size: ${pixelSize < 150 ? '12px' : '16px'}; /* Dynamic font size */
                font-weight: bold; 
                text-align: center;
              }
              .sticker-id-caption {
                font-size: 10px;
                color: #333333;
                margin-top: 8px;
              }
              @media print {
                body { margin: 0; justify-content: space-around; }
                .qr-print-item { margin: 10mm 5mm; }
                h1.print-header, p.print-header-info, hr.print-header-separator { display: none !important; }
              }
            </style>
          </head>
          <body>
            <h1 class="print-header" style="width:100%; text-align:center;">${pageTitle}</h1>
            <p class="print-header-info" style="width:100%; text-align:center;">Found ${qrsToPrint.length} QR Codes to print (Size: ${printSize}).</p>
            <hr class="print-header-separator" style="width:100%;"/>
      `;

      qrsToPrint.forEach(qr => {
        const qrUrl = `${qrDomain}/q/${qr.uniqueId}`;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${pixelSize}x${pixelSize}&data=${encodeURIComponent(qrUrl)}&color=FFFFFF&bgcolor=000000&qzone=1&format=png&margin=0`;
        
        printHtml += `
          <div class="qr-print-item">
            <div class="sticker-body">
              <img src="${qrImageUrl}" alt="QR Code for ${qr.uniqueId}" width="${pixelSize}" height="${pixelSize}" />
              <div class="sticker-text">Scan to Return</div>
            </div>
            <div class="sticker-id-caption">${qr.uniqueId}</div>
          </div>
        `;
      });

      printHtml += `
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
        toast({ 
          title: "Print Page Ready", 
          description: `A new tab has opened with ${qrsToPrint.length} QR Code(s). You can print this page (e.g., via Ctrl+P or Cmd+P).` 
        });
      } else {
         toast({
          title: "Pop-up Blocked",
          description: "Could not open the print page. Please disable your pop-up blocker for this site and try again.",
          variant: "destructive",
        });
      }
    } else {
       toast({ 
        title: "Print Notice", 
        description: `No active (non-deleted) QR codes found to print.`,
      });
    }
    
    setSelectedQrForPrint(null);
    setSelectedBatchForPrint(null);
  };

  if (isLoading && !allQrs.length && !batches.length) {
    return <div className="text-center py-10">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      
      <Tabs defaultValue="manageQrs" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-2xl">
          <TabsTrigger value="manageQrs"><QrCodeIcon className="mr-2 h-4 w-4" />Manage QR Codes</TabsTrigger>
          <TabsTrigger value="generateBatch"><PlusCircle className="mr-2 h-4 w-4" />Generate Batch</TabsTrigger>
          <TabsTrigger value="manageBatches"><ListFilter className="mr-2 h-4 w-4" />Manage Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="manageQrs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All QR Codes</CardTitle>
              <CardDescription>View, search, and prepare individual QR codes for printing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input 
                  type="search" 
                  placeholder="Search by ID, owner, status..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QR ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner ID</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQrs.map((qr) => (
                    <TableRow key={qr.id}>
                      <TableCell className="font-medium">{qr.uniqueId}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          qr.status === 'claimed' ? 'bg-green-100 text-green-700' :
                          qr.status === 'unclaimed' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {qr.status}
                        </span>
                      </TableCell>
                      <TableCell>{qr.ownerId || "N/A"}</TableCell>
                      <TableCell>{qr.batchId || "N/A"}</TableCell>
                      <TableCell>{new Date(qr.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handlePrintQr(qr)}>
                          <Printer className="mr-1 h-4 w-4" /> Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredQrs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No QR codes found matching your criteria.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="generateBatch" className="mt-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Generate New QR Code Batch</CardTitle>
              <CardDescription>Specify the number of QR codes to generate in a new batch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="batchSize">Number of QR Codes</Label>
                <Input 
                  id="batchSize" 
                  type="number" 
                  value={batchSize} 
                  onChange={(e) => setBatchSize(parseInt(e.target.value, 10))} 
                  min="1"
                  className="w-full"
                />
              </div>
              <Button onClick={handleGenerateBatch} className="w-full" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}} disabled={isLoading}>
                {isLoading ? 'Generating...' : <><PlusCircle className="mr-2 h-4 w-4" /> Generate Batch</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manageBatches" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Batches</CardTitle>
              <CardDescription>View details of generated batches and open them for printing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>QR Count</TableHead>
                    <TableHead>ID Range</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell>{batch.count}</TableCell>
                      <TableCell>{batch.startId} - {batch.endId}</TableCell>
                      <TableCell>{new Date(batch.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handlePrintBatch(batch)}>
                          <Printer className="mr-1 h-4 w-4" /> Print Batch
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {batches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No batches generated yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!selectedQrForPrint || !!selectedBatchForPrint} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedQrForPrint(null); setSelectedBatchForPrint(null); }}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Print Settings</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to prepare {selectedQrForPrint ? `QR Code ${selectedQrForPrint.uniqueId}` : selectedBatchForPrint ? `Batch ${selectedBatchForPrint.name}` : "items"} for printing. 
              Please select a print size. The items will open in a new tab for printing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="print-size-select">Select Print Size</Label>
            <Select value={printSize} onValueChange={(value) => setPrintSize(value as QrCodePrintSize)}>
              <SelectTrigger id="print-size-select" className="w-full">
                <SelectValue placeholder="Select print size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (e.g., for keys)</SelectItem>
                <SelectItem value="medium">Medium (e.g., for phones, wallets)</SelectItem>
                <SelectItem value="large">Large (e.g., for bags, laptops)</SelectItem>
                <SelectItem value="x-large">X-Large (e.g., for luggage)</SelectItem>
                <SelectItem value="xx-large">XX-Large (e.g., for equipment)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setSelectedQrForPrint(null); setSelectedBatchForPrint(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPrint} style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
              <Printer className="mr-2 h-4 w-4" /> 
              Open for Print
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    
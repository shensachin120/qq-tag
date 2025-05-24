export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsappLink?: string;
  linkedQrCodes: string[]; // Array of QR Code IDs
};

export type QrCodeStatus = "unclaimed" | "claimed" | "deleted";
export type QrCodePrintSize = "small" | "medium" | "large" | "x-large" | "xx-large";

export type QrCode = {
  id: string;
  uniqueId: string; // The ID embedded in the QR, e.g., "SF000001"
  status: QrCodeStatus;
  ownerId?: string; // User ID
  batchId?: string;
  createdAt: string; // ISO Date string
  claimedAt?: string; // ISO Date string
  contactInfo?: { // Denormalized for quick display on scan page
    email?: string;
    phone?: string;
    whatsappLink?: string;
  }
};

export type QrBatch = {
  id: string;
  name: string; // e.g., "Batch 2024-07-A"
  count: number;
  startId: string; // First uniqueId in batch
  endId: string;   // Last uniqueId in batch
  createdAt: string; // ISO Date string
};

// Mock data
export const mockUser: User = {
  id: "user123",
  name: "John Doe",
  email: "user@example.com",
  phone: "123-456-7890",
  whatsappLink: "https://wa.me/1234567890",
  linkedQrCodes: ["SF000001", "SF000002"],
};

export const mockQrCodes: QrCode[] = [
  { 
    id: "qr1", 
    uniqueId: "SF000001", 
    status: "claimed", 
    ownerId: "user123", 
    batchId: "batch1", 
    createdAt: new Date().toISOString(), 
    claimedAt: new Date().toISOString(),
    contactInfo: { email: "user@example.com", phone: "123-456-7890", whatsappLink: "https://wa.me/1234567890" }
  },
  { id: "qr2", uniqueId: "SF000002", status: "claimed", ownerId: "user123", batchId: "batch1", createdAt: new Date().toISOString(), claimedAt: new Date().toISOString(), contactInfo: { email: "user@example.com" } },
  { id: "qr3", uniqueId: "SF000003", status: "unclaimed", batchId: "batch1", createdAt: new Date().toISOString() },
  { id: "qr4", uniqueId: "SF000004", status: "deleted", batchId: "batch2", createdAt: new Date().toISOString() },
  { id: "qr5", uniqueId: "SF000005", status: "unclaimed", batchId: "batch2", createdAt: new Date().toISOString() },
];

export const mockQrBatches: QrBatch[] = [
  { id: "batch1", name: "Initial Batch Alpha", count: 3, startId: "SF000001", endId: "SF000003", createdAt: new Date().toISOString() },
  { id: "batch2", name: "Second Run Bravo", count: 2, startId: "SF000004", endId: "SF000005", createdAt: new Date().toISOString() },
];

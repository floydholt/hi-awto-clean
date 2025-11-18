export interface Lead {
  listingId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  createdAt: FirebaseFirestore.Timestamp;
}

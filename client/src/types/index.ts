export type Role = 'USER' | 'ADMIN' | 'AGENT';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED';
export type Condition = 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'FOR_PARTS';
export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'REJECTED' | 'REMOVED';
export type OrderStatus =
  | 'PLACED'
  | 'AGENT_ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'INSPECTION_PASSED'
  | 'INSPECTION_FAILED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_REFUSED'
  | 'RETURN_APPROVED'
  | 'RETURN_IN_TRANSIT'
  | 'RETURNED_TO_SELLER'
  | 'CANCELLED';

export type CashStatus = 'WITH_AGENT' | 'REMITTED' | 'PAYOUT_RELEASED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  status: AccountStatus;
  area?: string;
  createdAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  specSchema: {
    fields: Array<{
      name: string;
      label: string;
      type: 'string' | 'number' | 'boolean';
      required?: boolean;
    }>;
  };
  _count?: {
    listings: number;
  };
}

export interface ListingImage {
  id: string;
  url: string;
  position: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  categoryId: string;
  category: Category;
  title: string;
  brand: string;
  model: string;
  specs: Record<string, any>;
  condition: Condition;
  ageMonths?: number;
  price: number | string;
  area: string;
  description: string;
  status: ListingStatus;
  rejectReason?: string;
  isInspected: boolean;
  images: ListingImage[];
  seller: {
    id: string;
    name: string;
    phone?: string;
    area?: string;
    avgRating?: number;
    reviewCount?: number;
    memberSince?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  note?: string;
  actorId?: string;
  createdAt: string;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface Inspection {
  id: string;
  orderId: string;
  agentId: string;
  passed: boolean;
  checklist: Record<string, boolean>;
  serialNo?: string;
  notes?: string;
  createdAt: string;
  photos: InspectionPhoto[];
}

export interface CashEntry {
  id: string;
  orderId: string;
  agentId: string;
  amount: number | string;
  sellerPayout: number | string;
  status: CashStatus;
  remittedAt?: string;
  payoutAt?: string;
  createdAt: string;
  isOverdue?: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  productRating: number;
  sellerRating: number;
  comment?: string;
  hidden: boolean;
  sellerReply?: string;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  listingId: string;
  listing: Listing;
  buyerId: string;
  buyer: User;
  agentId?: string;
  agent?: User;
  status: OrderStatus;
  itemPrice: number | string;
  deliveryFee: number | string;
  commission: number | string;
  totalToCollect: number | string;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  deliveryOtp?: string;
  cancelReason?: string;
  refusalReason?: string;
  returnReason?: string;
  returnNotes?: string;
  pickupNotes?: string;
  createdAt: string;
  updatedAt: string;
  history?: OrderStatusHistory[];
  inspection?: Inspection;
  review?: Review;
  cash?: CashEntry;
  isBuyer?: boolean;
  isSeller?: boolean;
  isAdmin?: boolean;
  isAgent?: boolean;
}

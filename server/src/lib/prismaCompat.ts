export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INVITED: 'INVITED',
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const Condition = {
  LIKE_NEW: 'LIKE_NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  FOR_PARTS: 'FOR_PARTS',
} as const;

export type Condition = (typeof Condition)[keyof typeof Condition];

export const ListingStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  ACTIVE: 'ACTIVE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
  REJECTED: 'REJECTED',
  REMOVED: 'REMOVED',
} as const;

export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const OrderStatus = {
  PLACED: 'PLACED',
  AGENT_ASSIGNED: 'AGENT_ASSIGNED',
  PICKUP_SCHEDULED: 'PICKUP_SCHEDULED',
  PICKED_UP: 'PICKED_UP',
  INSPECTION_PASSED: 'INSPECTION_PASSED',
  INSPECTION_FAILED: 'INSPECTION_FAILED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  DELIVERY_REFUSED: 'DELIVERY_REFUSED',
  RETURN_APPROVED: 'RETURN_APPROVED',
  RETURN_IN_TRANSIT: 'RETURN_IN_TRANSIT',
  RETURNED_TO_SELLER: 'RETURNED_TO_SELLER',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const CashStatus = {
  WITH_AGENT: 'WITH_AGENT',
  REMITTED: 'REMITTED',
  PAYOUT_RELEASED: 'PAYOUT_RELEASED',
} as const;

export type CashStatus = (typeof CashStatus)[keyof typeof CashStatus];

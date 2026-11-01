import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateOtp(length: number = 6): string {
  // Generate cryptographically secure random numbers
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 8);
}

export async function verifyOtp(otp: string, hashedOtp: string): Promise<boolean> {
  return bcrypt.compare(otp, hashedOtp);
}

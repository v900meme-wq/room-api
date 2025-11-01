import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

// For login endpoint - stricter limit
export const ThrottleLogin = () =>
    Throttle({ default: { limit: 5, ttl: 60000 } }); // 5 attempts per minute

// For public endpoints - more lenient
export const ThrottlePublic = () =>
    Throttle({ default: { limit: 30, ttl: 60000 } }); // 30 per minute

// Skip rate limit (for specific routes if needed)
export const SkipThrottle = () => SetMetadata('skipThrottle', true);
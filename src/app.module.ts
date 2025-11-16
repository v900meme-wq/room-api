import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HouseModule } from './house/house.module';
import { RoomModule } from './room/room.module';
import { PaymentModule } from './payment/payment.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AdminModule } from './admin/admin.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 5,
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 15, // 15 requests / 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 60 seconds
        limit: 60, // 60 requests / 60 seconds
      },
    ]),
    PrismaModule,
    AuthModule,
    UserModule,
    HouseModule,
    RoomModule,
    PaymentModule,
    AuditLogModule,    // ← New
    AdminModule,        // ← New
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,  // ← New
    },
  ],
})
export class AppModule { }
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private auditLogService: AuditLogService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const auditMetadata = this.reflector.get<AuditLogMetadata>(
            AUDIT_LOG_KEY,
            context.getHandler(),
        );

        if (!auditMetadata) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const method = request.method;

        // Only log for authenticated users
        if (!user) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(async (data) => {
                const entityId = data?.id || request.params?.id;

                await this.auditLogService.create({
                    userId: user.id,
                    username: user.username,
                    action: auditMetadata.action,
                    entity: auditMetadata.entity,
                    entityId: entityId ? parseInt(entityId, 10) : undefined,
                    oldValue: method === 'PATCH' || method === 'DELETE' ? request.body : undefined,
                    newValue: method === 'POST' || method === 'PATCH' ? data : undefined,
                    ipAddress: request.ip,
                    userAgent: request.headers['user-agent'],
                });
            }),
        );
    }
}
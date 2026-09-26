import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { NAMEABLE_ROLES, nameUserSchema, type NameableRole } from '@bow/shared';
import type { PortalConfig } from '../config.ts';
import { parseBody } from '../validation.ts';
import { CONFIG } from '../tokens.ts';
import { SESSION_COOKIE } from './access.guard.ts';
import { AccessService } from './access.service.ts';
import { NamedUsersService } from './named-users.service.ts';
import { Internal, Public, SignedIn } from './rules.ts';

function nameableRole(value: string): NameableRole {
  const role = (NAMEABLE_ROLES as readonly string[]).find((r) => r === value);
  if (!role) throw new BadRequestException(`"${value}" is not a list the named users screen changes.`);
  return role as NameableRole;
}

@Controller('api')
export class AccessController {
  constructor(
    @Inject(AccessService) private readonly access: AccessService,
    @Inject(NamedUsersService) private readonly namedUsers: NamedUsersService,
    @Inject(CONFIG) private readonly config: PortalConfig,
  ) {}

  /** Who is signed in, and the anti-forgery token the browser sends back on every change. */
  @Public()
  @Get('session')
  async session(@Req() request: FastifyRequest) {
    const session = await this.access.resolveSession(request.cookies?.[SESSION_COOKIE]);
    return {
      businessTimeZone: this.config.businessTimeZone,
      user: session
        ? { kind: session.user.kind, name: session.user.name, roles: session.user.roles, isAdmin: session.user.isAdmin }
        : null,
      csrfToken: session?.csrfToken ?? null,
    };
  }

  @SignedIn()
  @Post('sign-out')
  @HttpCode(204)
  async signOut(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.access.endSession(request.portal!.sessionId);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  @Internal('see the named users')
  @Get('sales/named-users')
  listNamedUsers() {
    return this.namedUsers.list();
  }

  @Internal('change who is named', 'role manager')
  @Post('sales/named-users')
  @HttpCode(204)
  async name(@Req() request: FastifyRequest, @Body() body: unknown) {
    const input = parseBody(nameUserSchema, body);
    await this.namedUsers.name(request.portal!.user.id, input.internalUserId, input.role);
  }

  @Internal('change who is named', 'role manager')
  @Delete('sales/named-users/:userId/:role')
  @HttpCode(204)
  async remove(
    @Req() request: FastifyRequest,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('role') role: string,
  ) {
    await this.namedUsers.remove(request.portal!.user.id, userId, nameableRole(role));
  }

  @Internal('read the refused attempts list', 'internal admin')
  @Get('sales/refused-attempts')
  refusedAttempts() {
    return this.access.listRefusals();
  }
}

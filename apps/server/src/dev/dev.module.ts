import { Body, Controller, Get, Inject, Module, Res, UnauthorizedException, Post, HttpCode } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import type { LocalSignIn } from '../adapters/sign-in.ts';
import { SESSION_COOKIE } from '../access/access.guard.ts';
import { AccessModule } from '../access/access.module.ts';
import { AccessService } from '../access/access.service.ts';
import { Public } from '../access/rules.ts';
import type { PortalConfig } from '../config.ts';
import { CONFIG, SIGN_IN } from '../tokens.ts';
import { parseBody } from '../validation.ts';
import { WEB_INDEX } from '../web/pages.ts';

/**
 * Stage 1 stand-in pages (architecture §4.7). This module is loaded only when
 * the local stand-ins are selected, which the start-up guard allows only on
 * localhost; the production build leaves it out altogether.
 */

const signInSchema = z.object({ audience: z.enum(['staff', 'reseller']), subjectId: z.string().min(1) });

@Controller('dev')
export class DevController {
  constructor(
    @Inject(SIGN_IN) private readonly signIn: LocalSignIn,
    @Inject(AccessService) private readonly access: AccessService,
    @Inject(CONFIG) private readonly config: PortalConfig,
    @Inject(WEB_INDEX) private readonly indexHtml: string,
  ) {}

  @Public()
  @Get('sign-in')
  signInPage(@Res() reply: FastifyReply) {
    return reply.type('text/html').header('cache-control', 'no-store').send(this.indexHtml);
  }

  /** The fictional directory the development sign-in page lists. */
  @Public()
  @Get('api/people')
  people() {
    return this.signIn.list();
  }

  /** Completes sign-in as the person picked, with the same claims shape Entra ID returns. */
  @Public()
  @Post('api/sign-in')
  @HttpCode(204)
  async signInAs(@Body() body: unknown, @Res({ passthrough: true }) reply: FastifyReply) {
    const input = parseBody(signInSchema, body);
    const claims = this.signIn.completeSignIn(input.audience, input.subjectId);
    if (!claims) throw new UnauthorizedException('That person is not in the local directory.');
    const admission = await this.access.admit(claims);
    if (!admission.admitted) throw new UnauthorizedException(admission.reason);
    reply.setCookie(SESSION_COOKIE, admission.sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: this.config.publicUrl.protocol === 'https:',
    });
  }
}

@Module({ imports: [AccessModule], controllers: [DevController] })
export class DevModule {}

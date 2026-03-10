import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSessionService } from '../services/auth/auth-session.service';

export const mockAuthGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (authSession.hasActiveSession) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { mockAuthGuard } from './mock-auth.guard';
import { AuthSessionService } from '../services/auth/auth-session.service';

describe('mockAuthGuard', () => {
  const createGuardResult = () => TestBed.runInInjectionContext(() => mockAuthGuard({} as never, {} as never));

  it('consente accesso se sessione presente', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthSessionService,
          useValue: { hasActiveSession: true },
        },
        {
          provide: Router,
          useValue: { createUrlTree: jasmine.createSpy('createUrlTree') },
        },
      ],
    });

    expect(createGuardResult()).toBeTrue();
  });

  it('redireziona a login se sessione assente', () => {
    const loginTree = new UrlTree();
    const routerMock = {
      createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue(loginTree),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthSessionService,
          useValue: { hasActiveSession: false },
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    const result = createGuardResult();

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(loginTree);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';

import { GameSelectPage } from './game-select.page';

describe('GameSelectPage', () => {
  let component: GameSelectPage;
  let fixture: ComponentFixture<GameSelectPage>;
  let authMock: {
    currentUser: { userId: string; username: string };
    logout: jasmine.Spy;
  };

  beforeEach(async () => {
    authMock = {
      currentUser: { userId: 'u-mock', username: 'PlayerOne' },
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [GameSelectPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthSessionService,
          useValue: authMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('legge username da sessione', () => {
    expect(component.username).toBe('PlayerOne');
  });

  it('logout svuota sessione e torna al login', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    component.logout();

    expect(authMock.logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';

import { ProfilePage } from './profile.page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
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
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthSessionService,
          useValue: authMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renderizza il mark brand nel hero del profilo', () => {
    const logo = (fixture.nativeElement as HTMLElement).querySelector('.profile-brand-mark') as HTMLImageElement | null;

    expect(logo).not.toBeNull();
    expect(logo?.getAttribute('src')).toContain('gameland-mark-light.svg');
  });

  it('mostra username da sessione', () => {
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

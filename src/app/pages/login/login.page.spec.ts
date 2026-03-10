import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authMock: {
    isAuthenticated: jasmine.Spy;
    login: jasmine.Spy;
  };

  beforeEach(async () => {
    authMock = {
      isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
      login: jasmine.createSpy('login'),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        {
          provide: AuthSessionService,
          useValue: authMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra errore se username vuoto', () => {
    component.username = '   ';

    component.onSubmit();

    expect(component.usernameErrorVisible).toBeTrue();
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('naviga a game-select se login valido', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    component.username = 'Luca';
    component.password = 'any';
    component.onSubmit();

    expect(authMock.login).toHaveBeenCalledWith('Luca', 'any');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/game-select');
  });

  it('reindirizza subito se sessione gia attiva', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    authMock.isAuthenticated.and.returnValue(true);
    component.ngOnInit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/game-select');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';
import { DebugModeService } from 'src/app/services/debug-mode/debug-mode.service';

import { MobileShellPage } from './mobile-shell.page';

describe('MobileShellPage', () => {
  let component: MobileShellPage;
  let fixture: ComponentFixture<MobileShellPage>;
  let debugModeMock: {
    enabled: boolean;
    enabled$: BehaviorSubject<boolean>;
    setEnabled: jasmine.Spy;
  };

  beforeEach(async () => {
    debugModeMock = {
      enabled: false,
      enabled$: new BehaviorSubject<boolean>(false),
      setEnabled: jasmine.createSpy('setEnabled').and.callFake((enabled: boolean) => {
        debugModeMock.enabled = enabled;
        debugModeMock.enabled$.next(enabled);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [MobileShellPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: {} },
            firstChild: {
              snapshot: {
                data: {
                  shellTitle: 'Lobby',
                  shellSubtitle: 'Test shell',
                  shellTab: 'lobby',
                },
              },
              firstChild: null,
            },
          },
        },
        {
          provide: AuthSessionService,
          useValue: {
            currentUser: { userId: 'u-luca', username: 'Luca' },
          },
        },
        {
          provide: DebugModeService,
          useValue: debugModeMock,
        },
        {
          provide: MenuController,
          useValue: {
            close: jasmine.createSpy('close').and.resolveTo(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileShellPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderizza tab principali', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Lobby');
    expect(text).toContain('Giochi');
    expect(text).toContain('Chat');
    expect(text).toContain('Profilo');
  });

  it('renderizza il lockup orizzontale del brand nella shell', () => {
    const logo = (fixture.nativeElement as HTMLElement).querySelector('.shell-brand-lockup') as HTMLImageElement | null;

    expect(logo).not.toBeNull();
    expect(logo?.getAttribute('src')).toContain('gameland-logo-horizontal-light.svg');
  });

  it('naviga alla route selezionata dalla tab bar', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    component.navigateTo('/chat');

    expect(router.navigateByUrl).toHaveBeenCalledWith('/chat');
  });

  it('nasconde link debug quando debug mode e off', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Debug mode');
    expect(text).not.toContain('Debug avatars');
    expect(text).not.toContain('Catalogo avatar');
    expect(text).not.toContain('Matrice carte');
  });

  it('attiva debug mode al tap sulla riga dedicata', () => {
    const toggleRow = (fixture.nativeElement as HTMLElement).querySelector('.debug-toggle-shell') as HTMLElement;

    toggleRow.click();

    expect(debugModeMock.setEnabled).toHaveBeenCalledWith(true);
  });

  it('mostra link debug quando debug mode e on', () => {
    debugModeMock.enabled$.next(true);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Catalogo avatar');
    expect(text).toContain('Matrice carte');
    expect(text).not.toContain('Debug avatars');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthSessionService } from 'src/app/services/auth/auth-session.service';
import { MobileShellPage } from './mobile-shell.page';
describe('MobileShellPage', () => {
  let component: MobileShellPage;
  let fixture: ComponentFixture<MobileShellPage>;
  beforeEach(async () => {
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
  it('naviga alla route selezionata dalla tab bar', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    component.navigateTo('/chat');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/chat');
  });
});

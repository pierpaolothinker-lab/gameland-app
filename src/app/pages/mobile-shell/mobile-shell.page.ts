import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonRouterOutlet,
  IonToast,
  IonToggle,
} from '@ionic/angular/standalone';
import { MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  chatbubbleEllipsesOutline,
  gameControllerOutline,
  gridOutline,
  helpCircleOutline,
  homeOutline,
  imagesOutline,
  notificationsOutline,
  personCircleOutline,
  settingsOutline,
} from 'ionicons/icons';
import { filter } from 'rxjs';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';
import { DebugModeService } from 'src/app/services/debug-mode/debug-mode.service';

type ShellTabKey = 'lobby' | 'games' | 'chat' | 'profile';

interface ShellTab {
  key: ShellTabKey;
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-mobile-shell',
  templateUrl: './mobile-shell.page.html',
  styleUrls: ['./mobile-shell.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonButtons,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonRouterOutlet,
    IonToast,
    IonToggle,
    CommonModule,
    RouterLink,
  ],
})
export class MobileShellPage implements OnInit {
  readonly tabs: ShellTab[] = [
    { key: 'lobby', label: 'Lobby', route: '/tressette-lobby', icon: 'home-outline' },
    { key: 'games', label: 'Giochi', route: '/game-select', icon: 'game-controller-outline' },
    { key: 'chat', label: 'Chat', route: '/chat', icon: 'chatbubble-ellipses-outline' },
    { key: 'profile', label: 'Profilo', route: '/profile', icon: 'person-circle-outline' },
  ];

  currentTitle = 'Gameland';
  currentSubtitle = 'Navigazione ibrida mobile-first.';
  currentTab: ShellTabKey = 'games';
  toastOpen = false;
  toastMessage = '';
  debugModeEnabled = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly authSessionService: AuthSessionService,
    private readonly debugModeService: DebugModeService,
    private readonly menuController: MenuController,
    private readonly router: Router
  ) {
    addIcons({
      bookOutline,
      chatbubbleEllipsesOutline,
      gameControllerOutline,
      gridOutline,
      helpCircleOutline,
      homeOutline,
      imagesOutline,
      notificationsOutline,
      personCircleOutline,
      settingsOutline,
    });
  }

  ngOnInit(): void {
    this.debugModeService.enabled$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => {
        this.debugModeEnabled = enabled;
      });

    this.syncRouteMeta();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.syncRouteMeta();
      });
  }

  get username(): string {
    return this.authSessionService.currentUser.username;
  }

  get debugModeLabel(): string {
    return this.debugModeEnabled ? 'ON' : 'OFF';
  }

  navigateTo(route: string): void {
    void this.router.navigateByUrl(route);
  }

  isTabActive(tab: ShellTab): boolean {
    return this.currentTab === tab.key;
  }

  async openUtilityPlaceholder(label: string): Promise<void> {
    await this.menuController.close('utility-menu');
    this.toastMessage = `${label} disponibile presto in questa shell ibrida.`;
    this.toastOpen = true;
  }

  onDebugModeToggle(enabled: boolean): void {
    this.debugModeService.setEnabled(enabled);
    this.toastMessage = enabled
      ? 'Debug mode attivo: strumenti QA visibili in lobby e quick menu.'
      : 'Debug mode disattivato: UI tornata alla modalita standard.';
    this.toastOpen = true;
  }

  onToastDismiss(): void {
    this.toastOpen = false;
  }

  private syncRouteMeta(): void {
    const leaf = this.resolveLeafRoute(this.activatedRoute);
    const routeData = leaf.snapshot.data;

    this.currentTitle = (routeData['shellTitle'] as string | undefined) ?? 'Gameland';
    this.currentSubtitle =
      (routeData['shellSubtitle'] as string | undefined) ?? 'Navigazione ibrida mobile-first.';
    this.currentTab = (routeData['shellTab'] as ShellTabKey | undefined) ?? 'games';
  }

  private resolveLeafRoute(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }
}

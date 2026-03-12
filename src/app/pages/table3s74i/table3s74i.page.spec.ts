import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthSessionService, MockSessionUser } from 'src/app/services/auth/auth-session.service';
import { DebugModeService } from 'src/app/services/debug-mode/debug-mode.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { CardIT, Suit } from 'src/app/shared/domain/models/cardIT.model';
import { TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { Table3s74iPage } from './table3s74i.page';

describe('Table3s74iPage', () => {
  let component: Table3s74iPage;
  let fixture: ComponentFixture<Table3s74iPage>;

  let serviceMock: {
    getTableRealtime: jasmine.Spy;
    connectSocket: jasmine.Spy;
  };

  let authMock: {
    currentUser: MockSessionUser;
    currentUser$: BehaviorSubject<MockSessionUser>;
  };

  let dataModeMock: {
    mode: DataMode;
    mode$: BehaviorSubject<DataMode>;
    setMode: jasmine.Spy;
  };

  let debugModeMock: {
    enabled: boolean;
    enabled$: BehaviorSubject<boolean>;
  };

  let routeMock: {
    snapshot: { paramMap: ReturnType<typeof convertToParamMap> };
  };

  let routerMock: {
    navigate: jasmine.Spy;
  };

  let socketHandlersList: Record<string, (...args: any[]) => void>[];

  const tableMock: TressetteTableView = {
    tableId: 'tbl-001',
    owner: 'Luca',
    players: [
      { username: 'Luca', position: 'SUD' },
      { username: 'Marta', position: 'NORD' },
      { username: 'Diego', position: 'EST' },
      { username: 'Sara', position: 'OVEST' },
    ],
    isComplete: true,
    points: { teamSN: 0, teamEO: 0 },
    status: 'in_game',
    myHand: [new CardIT(Suit.Bastoni, 3), new CardIT(Suit.Spade, 5)],
    currentTrick: [],
  };

  const latestSocketHandlers = (): Record<string, (...args: any[]) => void> => {
    return socketHandlersList[socketHandlersList.length - 1] ?? {};
  };

  const buildHand = (): CardIT[] => {
    return [
      new CardIT(Suit.Bastoni, 1),
      new CardIT(Suit.Bastoni, 2),
      new CardIT(Suit.Bastoni, 3),
      new CardIT(Suit.Bastoni, 4),
      new CardIT(Suit.Bastoni, 5),
      new CardIT(Suit.Coppe, 6),
      new CardIT(Suit.Coppe, 7),
      new CardIT(Suit.Coppe, 8),
      new CardIT(Suit.Denari, 9),
      new CardIT(Suit.Spade, 10),
    ];
  };

  beforeEach(async () => {
    socketHandlersList = [];

    serviceMock = {
      getTableRealtime: jasmine.createSpy('getTableRealtime').and.returnValue(of(tableMock)),
      connectSocket: jasmine.createSpy('connectSocket').and.callFake(() => {
        const handlers: Record<string, (...args: any[]) => void> = {};
        socketHandlersList.push(handlers);

        return {
          on: jasmine.createSpy('on').and.callFake((event: string, cb: (...args: any[]) => void) => {
            handlers[event] = cb;
          }),
          emit: jasmine.createSpy('emit'),
          disconnect: jasmine.createSpy('disconnect'),
        };
      }),
    };

    authMock = {
      currentUser: { userId: 'u-luca', username: 'Luca' },
      currentUser$: new BehaviorSubject<MockSessionUser>({ userId: 'u-luca', username: 'Luca' }),
    };

    dataModeMock = {
      mode: 'demo',
      mode$: new BehaviorSubject<DataMode>('demo'),
      setMode: jasmine.createSpy('setMode').and.callFake((mode: DataMode) => {
        dataModeMock.mode = mode;
        dataModeMock.mode$.next(mode);
      }),
    };

    debugModeMock = {
      enabled: false,
      enabled$: new BehaviorSubject<boolean>(false),
    };

    routeMock = {
      snapshot: { paramMap: convertToParamMap({ tableId: 'tbl-001' }) },
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      imports: [Table3s74iPage],
      providers: [
        { provide: TressetteTableService, useValue: serviceMock },
        { provide: AuthSessionService, useValue: authMock },
        { provide: DataModeService, useValue: dataModeMock },
        { provide: DebugModeService, useValue: debugModeMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Table3s74iPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nasconde data mode nel gameplay quando debug mode e off', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Data Mode:');
  });

  it('mostra data mode nel gameplay quando debug mode e on', () => {
    debugModeMock.enabled$.next(true);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Data Mode:');
  });

  it('nasconde endpoint e metadata tavolo fuori debug', () => {
    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent ?? '';

    expect(element.querySelector('.gameplay-status')).toBeNull();
    expect(text).not.toContain('Endpoint');
    expect(text).not.toContain('Owner:');
    expect(text).not.toContain('Players:');
  });

  it('mostra endpoint e metadata tavolo quando debug mode e on', () => {
    debugModeMock.enabled$.next(true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const text = element.textContent ?? '';
    expect(element.querySelector('.gameplay-status')).not.toBeNull();
    expect(text).toContain('Socket');
    expect(text).toContain('Endpoint');
    expect(text).toContain('Owner:');
    expect(text).toContain('Players:');
  });

  it('carica tableId da route e usa backend realtime fetch', () => {
    expect(component.tableId).toBe('tbl-001');
    expect(serviceMock.getTableRealtime).toHaveBeenCalledWith('tbl-001');
    expect(serviceMock.connectSocket).toHaveBeenCalled();
  });

  it('emette watch-table con tableId mode e username su connect', () => {
    latestSocketHandlers()['connect']?.();

    const socket = serviceMock.connectSocket.calls.mostRecent().returnValue;
    expect(socket.emit).toHaveBeenCalledWith('tressette:watch-table', {
      tableId: 'tbl-001',
      mode: 'demo',
      username: 'Luca',
    });
  });

  it('renderizza scoreboard con SN/EO', () => {
    component.table = { ...tableMock, points: { teamSN: 4, teamEO: 7 } };
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Team SN');
    expect(text).toContain('Team EO');
    expect(text).toContain('4');
    expect(text).toContain('7');
  });

  it('aggiorna scoreboard da score-updated realtime', () => {
    latestSocketHandlers()['tressette:score-updated']?.({ points: { teamSN: 3, teamEO: 2 } });

    expect(component.table?.points.teamSN).toBe(3);
    expect(component.table?.points.teamEO).toBe(2);
  });

  it('bootstrap iniziale senza handNumber mostra Mano 1', () => {
    component.currentHandIndex = null;
    component.table = {
      ...tableMock,
      status: 'in_game',
      handNumber: undefined,
      handIndex: undefined,
    };

    latestSocketHandlers()['tressette:table-updated']?.({
      ...tableMock,
      status: 'in_game',
      handNumber: undefined,
      handIndex: undefined,
      currentTrick: [],
    });

    expect(component.handLabel).toBe('Mano 1');
  });
  it('transizione multi-mano mantiene in_game e usa handNumber backend senza doppio incremento', () => {
    latestSocketHandlers()['tressette:hand-ended']?.({ status: 'in_game', points: { teamSN: 2, teamEO: 1 }, handNumber: 1 });
    latestSocketHandlers()['tressette:hand-started']?.({
      status: 'in_game',
      handNumber: 2,
      myHand: buildHand(),
    });
    latestSocketHandlers()['tressette:hand-started']?.({
      status: 'in_game',
      handNumber: 2,
      myHand: buildHand(),
    });

    expect(component.table?.status).toBe('in_game');
    expect(component.effectiveHandCards.length).toBe(10);
    expect(component.handTransitionActive).toBeTrue();
    expect(component.handTransitionMessage).toContain('Nuova mano iniziata');
    expect(component.handLabel).toBe('Mano 2');
  });

  it('mostra errore chiaro su INVALID_SUIT_RESPONSE', () => {
    latestSocketHandlers()['tressette:error']?.({
      error: { code: 'INVALID_SUIT_RESPONSE', message: 'wrong suit' },
    });

    expect(component.errorMessage).toContain('devi rispondere al seme');
  });

  it('filtra carte giocabili quando c e seme di risposta obbligato', () => {
    component.table = {
      ...tableMock,
      status: 'in_game',
      myHand: [new CardIT(Suit.Coppe, 1), new CardIT(Suit.Denari, 2), new CardIT(Suit.Coppe, 3)],
      currentTrick: [{ position: 'NORD', username: 'Marta', card: new CardIT(Suit.Coppe, 7) }],
    };
    component.turnPlayerUsername = 'Luca';
    component.socketMessage = 'connected';

    const coppeCards = component.effectiveHandCards.filter((card) => card.suit === Suit.Coppe);
    const denariCard = component.effectiveHandCards.find((card) => card.suit === Suit.Denari);

    expect(coppeCards.length).toBe(2);
    expect(component.isCardPlayable(coppeCards[0])).toBeTrue();
    expect(component.isCardPlayable(coppeCards[1])).toBeTrue();
    expect(component.isCardPlayable(denariCard as CardIT)).toBeFalse();
  });

  it('trick-ended con trickCards mantiene 4 carte per 2s + winner banner e poi svuota', fakeAsync(() => {
    component.table = {
      ...tableMock,
      myHand: [new CardIT(Suit.Coppe, 10), new CardIT(Suit.Denari, 7)],
      currentTrick: [],
    };

    latestSocketHandlers()['tressette:trick-ended']?.({
      winner: 'Marta',
      winnerPosition: 'NORD',
      trickCards: [
        { position: 'NORD', username: 'Marta', card: new CardIT(Suit.Coppe, 3) },
        { position: 'EST', username: 'Diego', card: new CardIT(Suit.Denari, 4) },
        { position: 'SUD', username: 'Luca', card: new CardIT(Suit.Spade, 5) },
        { position: 'OVEST', username: 'Sara', card: new CardIT(Suit.Bastoni, 6) },
      ],
      points: { teamSN: 1, teamEO: 0 },
    });

    expect(component.trickWinnerMessage).toBe('Prende Marta');
    expect(component.table?.currentTrick?.length).toBe(4);

    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.game-table .trick-winner-overlay') as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(overlay?.textContent ?? '').toContain('Prende Marta');

    tick(2000);
    expect(component.trickRevealActive).toBeFalse();
    expect(component.table?.currentTrick?.length).toBe(0);
  }));



  it('usa fallback winner quando winner mancante', () => {
    latestSocketHandlers()['tressette:trick-ended']?.({
      trickCards: [
        { position: 'NORD', username: 'Marta', card: new CardIT(Suit.Coppe, 3) },
        { position: 'EST', username: 'Diego', card: new CardIT(Suit.Denari, 4) },
        { position: 'SUD', username: 'Luca', card: new CardIT(Suit.Spade, 5) },
        { position: 'OVEST', username: 'Sara', card: new CardIT(Suit.Bastoni, 6) },
      ],
    });

    fixture.detectChanges();
    expect(component.trickWinnerMessage).toBe('Prende -');
    const overlay = fixture.nativeElement.querySelector('.game-table .trick-winner-overlay') as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(overlay?.textContent ?? '').toContain('Prende -');
  });

  it('non sovrascrive winner message durante reveal con player-state successivi', () => {
    latestSocketHandlers()['tressette:trick-ended']?.({
      winner: 'Marta',
      trickCards: [
        { position: 'NORD', username: 'Marta', card: new CardIT(Suit.Coppe, 3) },
        { position: 'EST', username: 'Diego', card: new CardIT(Suit.Denari, 4) },
        { position: 'SUD', username: 'Luca', card: new CardIT(Suit.Spade, 5) },
        { position: 'OVEST', username: 'Sara', card: new CardIT(Suit.Bastoni, 6) },
      ],
    });

    latestSocketHandlers()['tressette:player-state']?.({
      currentTrick: [],
      lastTrickWinner: 'Sara',
    });

    fixture.detectChanges();
    expect(component.trickRevealActive).toBeTrue();
    expect(component.trickWinnerMessage).toBe('Prende Marta');
    const overlay = fixture.nativeElement.querySelector('.game-table .trick-winner-overlay') as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(overlay?.textContent ?? '').toContain('Prende Marta');
  });

  it('ordina la mano per seme e sovranita in visualizzazione', () => {
    component.table = {
      ...tableMock,
      myHand: [
        new CardIT(Suit.Bastoni, 4),
        new CardIT(Suit.Denari, 10),
        new CardIT(Suit.Coppe, 3),
        new CardIT(Suit.Spade, 2),
        new CardIT(Suit.Denari, 3),
      ],
    };

    const sorted = component.effectiveHandCards;
    expect(sorted.map((card) => `${card.suit}-${card.value}`)).toEqual([
      `${Suit.Denari}-3`,
      `${Suit.Denari}-10`,
      `${Suit.Spade}-2`,
      `${Suit.Coppe}-3`,
      `${Suit.Bastoni}-4`,
    ]);
  });

  it('mantiene reveal 2s su 4a carta manuale nonostante race events', fakeAsync(() => {
    component.table = {
      ...tableMock,
      myHand: [new CardIT(Suit.Coppe, 10), new CardIT(Suit.Bastoni, 7)],
      currentTrick: [
        { position: 'NORD', username: 'Marta', card: new CardIT(Suit.Coppe, 3) },
        { position: 'EST', username: 'Diego', card: new CardIT(Suit.Denari, 4) },
        { position: 'SUD', username: 'Luca', card: new CardIT(Suit.Spade, 5) },
      ],
    };

    latestSocketHandlers()['tressette:card-played']?.({
      source: 'manual',
      card: new CardIT(Suit.Bastoni, 6),
      username: 'Sara',
      position: 'OVEST',
      currentTrick: [],
      myHand: [],
    });

    expect(component.table?.currentTrick?.length).toBe(0);

    latestSocketHandlers()['tressette:table-updated']?.({
      ...tableMock,
      currentTrick: [],
      myHand: [],
    });
    latestSocketHandlers()['tressette:player-state']?.({ currentTrick: [], myHand: [] });
    latestSocketHandlers()['tressette:hand-started']?.({ status: 'in_game', myHand: [] });
    latestSocketHandlers()['tressette:hand-ended']?.({ status: 'in_game', points: { teamSN: 2, teamEO: 1 }, currentTrick: [] });
    latestSocketHandlers()['tressette:score-updated']?.({ points: { teamSN: 3, teamEO: 1 }, currentTrick: [] });

    expect(component.table?.currentTrick?.length).toBe(0);
    expect(component.table?.points).toEqual({ teamSN: 3, teamEO: 1 });

    latestSocketHandlers()['tressette:trick-ended']?.({
      winner: 'Sara',
      trickCards: [
        { position: 'NORD', username: 'Marta', card: new CardIT(Suit.Coppe, 3) },
        { position: 'EST', username: 'Diego', card: new CardIT(Suit.Denari, 4) },
        { position: 'SUD', username: 'Luca', card: new CardIT(Suit.Spade, 5) },
        { position: 'OVEST', username: 'Sara', card: new CardIT(Suit.Bastoni, 6) },
      ],
    });

    latestSocketHandlers()['tressette:table-updated']?.({
      ...tableMock,
      currentTrick: [],
      myHand: [],
    });
    latestSocketHandlers()['tressette:player-state']?.({ currentTrick: [], myHand: [] });
    latestSocketHandlers()['tressette:score-updated']?.({ points: { teamSN: 4, teamEO: 1 }, currentTrick: [] });

    expect(component.trickRevealActive).toBeTrue();
    expect(component.trickWinnerMessage).toBe('Prende Sara');
    fixture.detectChanges();
    const overlayManual = fixture.nativeElement.querySelector('.game-table .trick-winner-overlay') as HTMLElement | null;
    expect(overlayManual).not.toBeNull();
    expect(overlayManual?.textContent ?? '').toContain('Prende Sara');
    expect(component.table?.currentTrick?.length).toBe(4);
    expect(component.table?.points).toEqual({ teamSN: 4, teamEO: 1 });

    tick(1999);
    expect(component.trickRevealActive).toBeTrue();
    expect(component.table?.currentTrick?.length).toBe(4);

    tick(1);
    expect(component.trickRevealActive).toBeFalse();
    expect(component.table?.currentTrick?.length).toBe(0);
  }));
  it('renderizza turno da payload canonico currentPlayer', () => {
    latestSocketHandlers()['tressette:turn-updated']?.({
      currentPlayer: { username: 'Diego', position: 'EST' },
      secondsRemaining: 17,
    });
    fixture.detectChanges();

    expect(component.currentTurnLabel).toBe('Diego (EST)');
    const activeSeats = fixture.nativeElement.querySelectorAll('.seat.turn');
    expect(activeSeats.length).toBe(1);
    expect((activeSeats[0] as HTMLElement).className).toContain('seat-east');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('17s');
  });

  it('timer parte e decrementa da secondsRemaining', fakeAsync(() => {
    latestSocketHandlers()['tressette:turn-started']?.({ turnPlayer: 'Luca', turnPosition: 'SUD', secondsRemaining: 2 });

    expect(component.countdownSeconds).toBe(2);
    tick(1000);
    expect(component.countdownSeconds).toBe(1);
    tick(1000);
    expect(component.countdownSeconds).toBe(0);
  }));

  it('mostra overlay pre-game su evento countdown e renderizza secondi', () => {
    latestSocketHandlers()['tressette:game-start-countdown']?.({ tableId: 'tbl-001', secondsRemaining: 5 });

    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.pregame-overlay') as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(component.preGameCountdownActive).toBeTrue();
    expect(component.preGameSecondsRemaining).toBe(5);
    expect((overlay?.textContent ?? '')).toContain('La partita sta per cominciare');
    expect((overlay?.textContent ?? '')).toContain('5');
  });

  it('decrementa countdown pre-game e sblocca a fine timer', fakeAsync(() => {
    component.table = { ...tableMock, status: 'in_game' };
    component.turnPlayerUsername = 'Luca';
    component.socketMessage = 'connected';

    latestSocketHandlers()['tressette:game-start-countdown']?.({ tableId: 'tbl-001', secondsRemaining: 2 });
    expect(component.preGameCountdownActive).toBeTrue();
    expect(component.preGameSecondsRemaining).toBe(2);
    expect(component.canPlayCards).toBeFalse();

    tick(1000);
    expect(component.preGameSecondsRemaining).toBe(1);
    expect(component.canPlayCards).toBeFalse();

    tick(1000);
    fixture.detectChanges();
    expect(component.preGameCountdownActive).toBeFalse();
    expect(component.preGameSecondsRemaining).toBe(0);
    expect(component.canPlayCards).toBeTrue();
    const overlay = fixture.nativeElement.querySelector('.pregame-overlay') as HTMLElement | null;
    expect(overlay).toBeNull();
  }));
  it('render connected state quando socket connette', () => {
    latestSocketHandlers()['connect']?.();

    expect(component.isSocketConnected).toBeTrue();
    expect(component.connectionBannerVisible).toBeFalse();
    expect(component.socketMessage).toBe('connected');
  });

  it('gestisce errore snapshot tavolo', () => {
    serviceMock.getTableRealtime.and.returnValue(throwError(() => new Error('offline')));
    const localFixture = TestBed.createComponent(Table3s74iPage);
    const localComponent = localFixture.componentInstance;

    localFixture.detectChanges();

    expect(localComponent.errorMessage).toContain('Tavolo non trovato');
  });
  it('mostra badge BOT sui seat in gameplay e normalizza nome Bot', () => {
    component.table = {
      ...tableMock,
      players: [
        { username: 'Luca', position: 'SUD', isBot: false },
        { username: 'BOT_1', position: 'NORD', isBot: true },
        { username: 'Diego', position: 'EST', isBot: false },
        { username: 'Sara', position: 'OVEST', isBot: false },
      ],
    };

    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('BOT_1');
  });

  
  it('renderizza avatar umano e bot nelle seat card', () => {
    component.table = {
      ...tableMock,
      players: [
        { username: 'Luca', position: 'SUD', isBot: false },
        { username: 'BOT_1', position: 'NORD', isBot: true },
        { username: 'Diego', position: 'EST', isBot: false },
        { username: 'Sara', position: 'OVEST', isBot: false },
      ],
    };

    fixture.detectChanges();

    const avatars = fixture.nativeElement.querySelectorAll('.seat-avatar') as NodeListOf<HTMLImageElement>;
    expect(avatars.length).toBe(4);

    const northAvatar = fixture.nativeElement.querySelector('.seat-north .seat-avatar') as HTMLImageElement | null;
    const southAvatar = fixture.nativeElement.querySelector('.seat-south .seat-avatar') as HTMLImageElement | null;

    expect(northAvatar?.getAttribute('src')).toContain('assets/avatar-bot.svg');
    expect(southAvatar?.getAttribute('src')).toMatch(/^assets\/avatars\/players\/(player-(0[1-9]|1[0-9]|20)|animals\/animal-(0[1-9]|1[0-9]|20))\.svg$/);
  });
  
  it('nasconde badge turno e countdown durante trick reveal attivo', () => {
    component.turnPlayerPosition = 'NORD';
    component.turnPlayerUsername = 'Marta';
    component.countdownSeconds = 12;
    component.trickRevealActive = true;

    fixture.detectChanges();

    const turnSeats = fixture.nativeElement.querySelectorAll('.seat.turn');
    const turnBadges = fixture.nativeElement.querySelectorAll('.turn-badge');
    const turnCountdowns = fixture.nativeElement.querySelectorAll('.turn-countdown');

    expect(turnSeats.length).toBe(0);
    expect(turnBadges.length).toBe(0);
    expect(turnCountdowns.length).toBe(0);
  });

  it('applica variante colore bot deterministica in gameplay', () => {
    component.table = {
      ...tableMock,
      players: [
        { username: 'Luca', position: 'SUD', isBot: false },
        { username: 'BOT_1', position: 'NORD', isBot: true },
        { username: 'Diego', position: 'EST', isBot: false },
        { username: 'Sara', position: 'OVEST', isBot: false },
      ],
    };

    fixture.detectChanges();

    const northAvatar = fixture.nativeElement.querySelector('.seat-north .seat-avatar') as HTMLImageElement | null;
    expect(northAvatar).not.toBeNull();
    expect(northAvatar?.className).toContain('bot-avatar');
    expect(northAvatar?.className).toMatch(/bot-variant-[0-5]/);
  });
  it('disabilita play-card quando utente sessione e bot', () => {
    authMock.currentUser = { userId: 'u-bot', username: 'BOT_1' };
    component.table = {
      ...tableMock,
      players: [
        { username: 'BOT_1', position: 'SUD', isBot: true },
        { username: 'Marta', position: 'NORD', isBot: false },
        { username: 'Diego', position: 'EST', isBot: false },
        { username: 'Sara', position: 'OVEST', isBot: false },
      ],
    };
    component.turnPlayerUsername = 'BOT_1';
    component.socketMessage = 'connected';

    expect(component.canPlayCards).toBeFalse();
  });
  it('toggle chat rapida e menu contestuale in mutua esclusione', () => {
    component.toggleQuickChat();
    expect(component.quickChatOpen).toBeTrue();
    expect(component.contextMenuOpen).toBeFalse();

    component.toggleContextMenu();
    expect(component.contextMenuOpen).toBeTrue();
    expect(component.quickChatOpen).toBeFalse();
  });

  it('renderizza accesso rapido al trick precedente nell area top-right del tavolo', () => {
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.game-table .previous-trick-entry') as HTMLButtonElement | null;
    expect(trigger).not.toBeNull();
    expect(trigger?.textContent ?? '').toContain('Trick');
  });

  it('mostra stato vuoto chiaro quando non esiste ancora un trick precedente', () => {
    component.togglePreviousTrickPeek();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.previous-trick-panel') as HTMLElement | null;
    expect(panel).not.toBeNull();
    expect(panel?.textContent ?? '').toContain('Nessun trick precedente disponibile.');
    expect(panel?.textContent ?? '').not.toContain('Trick precedente');
  });

  it('salva il trick precedente su trick-ended e lo mostra nel quick peek', () => {
    latestSocketHandlers()['tressette:trick-ended']?.({
      winner: 'Marta',
      trickCards: [
        { position: 'NORD', username: 'Marta', card: new CardIT(Suit.Coppe, 3) },
        { position: 'EST', username: 'Diego', card: new CardIT(Suit.Denari, 4) },
        { position: 'SUD', username: 'Luca', card: new CardIT(Suit.Spade, 5) },
        { position: 'OVEST', username: 'Sara', card: new CardIT(Suit.Bastoni, 6) },
      ],
    });

    expect(component.hasPreviousTrick).toBeTrue();
    expect(component.getPreviousTrickCard('NORD')).toEqual(new CardIT(Suit.Coppe, 3));

    component.togglePreviousTrickPeek();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.previous-trick-slot app-card-na');
    expect(cards.length).toBe(4);
    expect(fixture.nativeElement.querySelector('.previous-trick-slot.peek-nord')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.previous-trick-slot.peek-est')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.previous-trick-slot.peek-sud')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.previous-trick-slot.peek-ovest')).not.toBeNull();
  });

  it('mantiene quick peek, chat e menu contestuale in mutua esclusione', () => {
    component.togglePreviousTrickPeek();
    expect(component.previousTrickPeekOpen).toBeTrue();
    expect(component.quickChatOpen).toBeFalse();
    expect(component.contextMenuOpen).toBeFalse();

    component.toggleQuickChat();
    expect(component.quickChatOpen).toBeTrue();
    expect(component.previousTrickPeekOpen).toBeFalse();

    component.togglePreviousTrickPeek();
    expect(component.previousTrickPeekOpen).toBeTrue();
    expect(component.quickChatOpen).toBeFalse();

    component.toggleContextMenu();
    expect(component.contextMenuOpen).toBeTrue();
    expect(component.previousTrickPeekOpen).toBeFalse();
  });

  it('azione torna alla lobby dal menu gameplay', () => {
    component.previousTrickPeekOpen = true;
    component.contextMenuOpen = true;

    component.goToLobby();

    expect(component.contextMenuOpen).toBeFalse();
    expect(component.previousTrickPeekOpen).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/tressette-lobby']);
  });
});




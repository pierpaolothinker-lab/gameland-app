import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthSessionService, MockSessionUser } from 'src/app/services/auth/auth-session.service';
import { DebugModeService } from 'src/app/services/debug-mode/debug-mode.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { TressetteLobbyPage } from './tressette-lobby.page';

describe('TressetteLobbyPage', () => {
  let component: TressetteLobbyPage;
  let fixture: ComponentFixture<TressetteLobbyPage>;
  let serviceMock: {
    listTables: jasmine.Spy;
    createTable: jasmine.Spy;
    joinTable: jasmine.Spy;
    addBot: jasmine.Spy;
    startTable: jasmine.Spy;
  };
  let authMock: {
    availableUsers: MockSessionUser[];
    currentUser: MockSessionUser;
    currentUser$: BehaviorSubject<MockSessionUser>;
    setActiveUser: jasmine.Spy;
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
  let routerMock: {
    navigate: jasmine.Spy;
  };

  const activeUser: MockSessionUser = { userId: 'u-luca', username: 'Luca' };

  const makeTable = (
    tableId: string,
    owner: string,
    status: 'waiting' | 'in_game' | 'ended',
    players: TressetteTableView['players'],
    isComplete = false
  ): TressetteTableView => ({
    tableId,
    owner,
    players,
    isComplete,
    points: { teamSN: 0, teamEO: 0 },
    status,
  });

  beforeEach(async () => {
    const baseTable = makeTable('table-1', 'owner-a', 'waiting', [{ username: 'owner-a', position: 'SUD' }]);
    serviceMock = {
      listTables: jasmine.createSpy('listTables').and.returnValue(of([baseTable])),
      createTable: jasmine.createSpy('createTable').and.returnValue(of(baseTable)),
      joinTable: jasmine.createSpy('joinTable').and.returnValue(of(baseTable)),
      addBot: jasmine.createSpy('addBot').and.returnValue(of(baseTable)),
      startTable: jasmine.createSpy('startTable').and.returnValue(of(baseTable)),
    };

    authMock = {
      availableUsers: [activeUser, { userId: 'u-marta', username: 'Marta' }],
      currentUser: activeUser,
      currentUser$: new BehaviorSubject<MockSessionUser>(activeUser),
      setActiveUser: jasmine.createSpy('setActiveUser'),
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

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      imports: [TressetteLobbyPage],
      providers: [
        { provide: TressetteTableService, useValue: serviceMock },
        { provide: AuthSessionService, useValue: authMock },
        { provide: DataModeService, useValue: dataModeMock },
        { provide: DebugModeService, useValue: debugModeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TressetteLobbyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('nasconde controlli debug in lobby quando debug mode e off', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Data Mode');
    expect(text).not.toContain('Switch utente mock');
  });

  it('mostra controlli debug in lobby quando debug mode e on', () => {
    debugModeMock.enabled$.next(true);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Data Mode');
    expect(text).toContain('Switch utente mock');
  });

  it('renderizza il mark brand nel header lobby', () => {
    const logo = (fixture.nativeElement as HTMLElement).querySelector('.lobby-brand-mark') as HTMLImageElement | null;

    expect(logo).not.toBeNull();
    expect(logo?.getAttribute('src')).toContain('gameland-mark-light.svg');
  });

  it('render lista tavoli', () => {
    expect(serviceMock.listTables).toHaveBeenCalledTimes(1);
    expect(component.tables.length).toBe(1);
  });

  it('rimuove la sezione Start owner e renderizza CTA centrale su ogni tavolo', () => {
    component.tables = [
      makeTable('table-center', 'Luca', 'waiting', [{ username: 'Luca', position: 'SUD' }]),
    ];

    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const center = fixture.nativeElement.querySelector('.table-center-cta') as HTMLButtonElement | null;

    expect(text).not.toContain('Start owner');
    expect(center).not.toBeNull();
  });

  it('cta centrale passiva quando tavolo non e pronto', () => {
    component.tables = [
      makeTable('tbl-not-ready', 'Luca', 'waiting', [{ username: 'Luca', position: 'SUD' }]),
    ];

    fixture.detectChanges();

    const center = fixture.nativeElement.querySelector('.table-center-cta') as HTMLButtonElement | null;
    const hint = fixture.nativeElement.querySelector('.table-center-hint') as HTMLElement | null;

    expect(center).not.toBeNull();
    expect(center?.disabled).toBeTrue();
    expect(center?.className).not.toContain('ready');
    expect(hint?.textContent).toContain('1/4 posti');
  });

  it('cta centrale pronta ma non owner resta non attivabile', () => {
    component.tables = [
      makeTable(
        'tbl-ready-other-owner',
        'Marta',
        'waiting',
        [
          { username: 'Luca', position: 'SUD' },
          { username: 'Marta', position: 'NORD' },
          { username: 'Diego', position: 'EST' },
          { username: 'Sara', position: 'OVEST' },
        ],
        true
      ),
    ];

    fixture.detectChanges();

    const center = fixture.nativeElement.querySelector('.table-center-cta') as HTMLButtonElement | null;

    expect(center).not.toBeNull();
    expect(center?.disabled).toBeTrue();
    expect(center?.className).toContain('awaiting-owner');

    component.onTableCenterClick(component.tables[0]);

    expect(serviceMock.startTable).not.toHaveBeenCalled();
  });

  it('click seat vuoto -> join quando utente non e seduto in nessun tavolo', () => {
    component.tables = [
      makeTable('table-join', 'Marta', 'waiting', [{ username: 'Marta', position: 'SUD' }]),
    ];

    component.onEmptySeatClick(component.tables[0], 'NORD');

    expect(serviceMock.joinTable).toHaveBeenCalledWith('table-join', 'Luca', 'NORD');
    expect(serviceMock.addBot).not.toHaveBeenCalled();
  });

  it('click seat vuoto -> add bot quando owner e gia seduto sullo stesso tavolo', () => {
    component.tables = [
      makeTable('table-owner', 'Luca', 'waiting', [
        { username: 'Luca', position: 'SUD' },
        { username: 'Marta', position: 'NORD' },
      ]),
    ];

    component.onEmptySeatClick(component.tables[0], 'EST');

    expect(serviceMock.addBot).toHaveBeenCalledWith('table-owner', 'Luca', 'EST');
    expect(serviceMock.joinTable).not.toHaveBeenCalled();
  });

  it('click seat vuoto su tavolo diverso quando utente e gia seduto altrove -> no-op', () => {
    component.tables = [
      makeTable('table-a', 'Luca', 'waiting', [{ username: 'Luca', position: 'SUD' }]),
      makeTable('table-b', 'Marta', 'waiting', [{ username: 'Marta', position: 'SUD' }]),
    ];

    component.onEmptySeatClick(component.tables[1], 'EST');

    expect(serviceMock.addBot).not.toHaveBeenCalled();
    expect(serviceMock.joinTable).not.toHaveBeenCalled();
  });

  it('click seat vuoto same table ma non owner -> no-op', () => {
    component.tables = [
      makeTable('table-a', 'Marta', 'waiting', [
        { username: 'Luca', position: 'SUD' },
        { username: 'Marta', position: 'NORD' },
      ]),
    ];

    component.onEmptySeatClick(component.tables[0], 'EST');

    expect(serviceMock.addBot).not.toHaveBeenCalled();
    expect(serviceMock.joinTable).not.toHaveBeenCalled();
  });

  it('nessun bottone esplicito Siediti/Aggiungi Bot nel markup seat', () => {
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Siediti');
    expect(text).not.toContain('Aggiungi Bot');
  });
  it('nasconde crea tavolo quando utente e gia seduto', () => {
    component.tables = [
      makeTable('table-a', 'Luca', 'waiting', [{ username: 'Luca', position: 'SUD' }]),
    ];

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Crea Tavolo');
    expect(text).toContain('Sei gia seduto al tavolo table-a.');

    component.createTable();
    expect(serviceMock.createTable).not.toHaveBeenCalled();
  });

  it('non renderizza label posizione nelle seat card lobby', () => {
    component.tables = [
      makeTable('table-a', 'Luca', 'waiting', [
        { username: 'Luca', position: 'SUD' },
        { username: 'Marta', position: 'NORD' },
      ]),
    ];

    fixture.detectChanges();
    const seatLabels = fixture.nativeElement.querySelectorAll('.seat-label');

    expect(seatLabels.length).toBe(0);
  });

  it('mostra BOT badge senza username bot', () => {
    component.tables = [
      makeTable('tbl-bot', 'Luca', 'waiting', [
        { username: 'Luca', position: 'SUD' },
        { username: 'Bot-1', position: 'NORD', isBot: true },
      ]),
    ];

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('BOT');
    expect(text).not.toContain('Bot-1');
  });

  
  it('renderizza avatar umano e bot nella lobby occupata', () => {
    component.tables = [
      makeTable('tbl-bot', 'Luca', 'waiting', [
        { username: 'Luca', position: 'SUD' },
        { username: 'Bot-1', position: 'NORD', isBot: true },
      ]),
    ];

    fixture.detectChanges();

    const northAvatar = fixture.nativeElement.querySelector('.seat-nord .seat-avatar') as HTMLImageElement | null;
    const southAvatar = fixture.nativeElement.querySelector('.seat-sud .seat-avatar') as HTMLImageElement | null;

    expect(northAvatar?.getAttribute('src')).toContain('assets/avatar-bot.svg');
    expect(northAvatar?.className).toContain('bot-avatar');
    expect(northAvatar?.className).toMatch(/bot-variant-[0-5]/);
    expect(southAvatar?.getAttribute('src')).toMatch(/^assets\/avatars\/players\/(player-(0[1-9]|1[0-9]|20)|animals\/animal-(0[1-9]|1[0-9]|20))\.svg$/);
    expect(southAvatar?.className).toContain('human-avatar');
  });
  it('gestione errore API', () => {
    serviceMock.listTables.and.returnValue(throwError(() => new Error('offline')));

    component.refreshTables();

    expect(component.errorBanner).toContain('Errore caricamento lobby');
    expect(component.loading).toBeFalse();
  });

  it('cta centrale owner pronto -> navigation a gameplay con tableId', () => {
    component.tables = [
      makeTable('tbl-owner-not-ready', 'Luca', 'waiting', [{ username: 'Luca', position: 'SUD' }]),
      makeTable(
        'tbl-owner-ready',
        'Luca',
        'waiting',
        [
          { username: 'Luca', position: 'SUD' },
          { username: 'Marta', position: 'NORD' },
          { username: 'Diego', position: 'EST' },
          { username: 'Sara', position: 'OVEST' },
        ],
        true
      ),
    ];

    fixture.detectChanges();

    const centers = fixture.nativeElement.querySelectorAll('.table-center-cta') as NodeListOf<HTMLButtonElement>;

    expect(centers[0].disabled).toBeTrue();
    expect(centers[1].disabled).toBeFalse();

    centers[1].click();

    expect(serviceMock.startTable).toHaveBeenCalledWith('tbl-owner-ready', 'Luca');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/table3s74i', 'tbl-owner-ready']);
  });
});


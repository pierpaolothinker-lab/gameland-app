import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DebugAvatarsPage } from './debug-avatars.page';

describe('DebugAvatarsPage', () => {
  let component: DebugAvatarsPage;
  let fixture: ComponentFixture<DebugAvatarsPage>;

  const createDataset = (humanCount: number, animalCount: number): Array<{ id: string; file: string; type: string }> => {
    const humans = Array.from({ length: humanCount }, (_, index) => ({
      id: `player-${String(index + 1).padStart(2, '0')}`,
      file: `assets/avatars/players/player-${String(index + 1).padStart(2, '0')}.svg`,
      type: 'human',
    }));

    const animals = Array.from({ length: animalCount }, (_, index) => ({
      id: `animal-${String(index + 1).padStart(2, '0')}`,
      file: `assets/avatars/players/animals/animal-${String(index + 1).padStart(2, '0')}.svg`,
      type: 'animal',
    }));

    return [...humans, ...animals];
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugAvatarsPage, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DebugAvatarsPage);
    component = fixture.componentInstance;
  });

  it('renderizza sezioni human e animal', () => {
    component.ingestManifest(createDataset(20, 20));
    component.ngOnInit = () => undefined;
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Human avatars');
    expect(html.textContent).toContain('Animal avatars');
  });

  it('mostra conteggi corretti con dataset completo', () => {
    component.ingestManifest(createDataset(20, 20));

    expect(component.humanAvatars.length).toBe(20);
    expect(component.animalAvatars.length).toBe(20);
    expect(component.totalLoaded).toBe(40);
    expect(component.hasCountWarning).toBeFalse();
  });

  it('attiva warning con dataset incompleto', () => {
    component.ingestManifest(createDataset(20, 10));

    expect(component.totalLoaded).toBe(30);
    expect(component.hasCountWarning).toBeTrue();
  });
});

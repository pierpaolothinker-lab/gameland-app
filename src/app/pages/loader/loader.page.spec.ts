import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderPage } from './loader.page';

describe('LoaderPage', () => {
  let component: LoaderPage;
  let fixture: ComponentFixture<LoaderPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renderizza il mark del brand sopra lo spinner', () => {
    const host = fixture.nativeElement as HTMLElement;
    const logo = host.querySelector('.loader-mark') as HTMLImageElement | null;
    const spinner = host.querySelector('ion-spinner');

    expect(logo).not.toBeNull();
    expect(logo?.getAttribute('src')).toContain('gameland-mark-light.svg');
    expect(spinner).not.toBeNull();
  });
});

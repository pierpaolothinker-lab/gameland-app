import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { IonBadge, IonCard, IonCardContent, IonContent } from '@ionic/angular/standalone';

interface AvatarManifestItem {
  id: string;
  file: string;
  type?: string;
}

interface AvatarManifestPayload {
  avatars?: AvatarManifestItem[];
}

type AvatarType = 'human' | 'animal';

interface AvatarCatalogItem {
  id: string;
  file: string;
  type: AvatarType;
}

interface AvatarPreviewSize {
  className: string;
  label: string;
  pixels: number;
}

@Component({
  selector: 'app-debug-avatars',
  templateUrl: './debug-avatars.page.html',
  styleUrls: ['./debug-avatars.page.scss'],
  standalone: true,
  imports: [IonBadge, IonCard, IonCardContent, IonContent, CommonModule],
})
export class DebugAvatarsPage implements OnInit {
  readonly previewSizes: AvatarPreviewSize[] = [
    { className: 'size-32', label: '32', pixels: 32 },
    { className: 'size-40', label: '40', pixels: 40 },
    { className: 'size-56', label: '56', pixels: 56 },
    { className: 'size-96', label: '96', pixels: 96 },
  ];

  humanAvatars: AvatarCatalogItem[] = [];
  animalAvatars: AvatarCatalogItem[] = [];
  loading = true;
  loadError = '';

  readonly expectedHuman = 20;
  readonly expectedAnimal = 20;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<AvatarManifestPayload>('assets/avatars/players/manifest.json')
      .pipe(
        catchError(() => {
          this.loadError = 'Impossibile caricare il manifest avatar.';
          this.loading = false;
          return of({ avatars: [] } satisfies AvatarManifestPayload);
        })
      )
      .subscribe((payload) => {
        this.ingestManifest(payload.avatars ?? []);
      });
  }

  get totalLoaded(): number {
    return this.humanAvatars.length + this.animalAvatars.length;
  }

  get hasCountWarning(): boolean {
    return (
      this.humanAvatars.length !== this.expectedHuman ||
      this.animalAvatars.length !== this.expectedAnimal ||
      this.totalLoaded !== this.expectedHuman + this.expectedAnimal
    );
  }

  ingestManifest(avatars: AvatarManifestItem[]): void {
    const normalized: AvatarCatalogItem[] = avatars.map((item) => ({
      id: item.id,
      file: item.file,
      type: this.resolveType(item),
    }));

    this.humanAvatars = normalized.filter((item) => item.type === 'human');
    this.animalAvatars = normalized.filter((item) => item.type === 'animal');
    this.loading = false;
  }

  private resolveType(item: AvatarManifestItem): AvatarType {
    const declaredType = item.type?.trim().toLowerCase();
    if (declaredType === 'human' || declaredType === 'animal') {
      return declaredType;
    }

    const probe = `${item.file}|${item.id}`.toLowerCase();
    if (probe.includes('/animals/') || probe.includes('animal-')) {
      return 'animal';
    }

    return 'human';
  }
}
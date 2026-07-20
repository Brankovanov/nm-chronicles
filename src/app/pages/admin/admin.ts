import { Component, computed, effect, inject, signal, type Signal } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';
import { APP_ENVIRONMENT_CONFIG, buildAssetUrl } from '../../config';

@Component({
  standalone: true,
  selector: 'app-admin', 
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class Admin {
  private readonly adminApi = inject(AdminApiService);
  private readonly envConfig = inject(APP_ENVIRONMENT_CONFIG);

  readonly dataFiles = signal<string[]>([]);
  readonly selectedFile = signal<string>('');
  readonly fileContent = signal<string>('');
  readonly images = signal<string[]>([]);
  readonly imagePath = signal('');
  readonly imagePreview = signal<string | null>(null);
  readonly status = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  readonly hasSelectedFile: Signal<boolean> = computed(() => !!this.selectedFile());

  constructor() {
    this.loadDataFiles();
    this.loadImages();

    effect(() => {
      this.error();
    });
  }

  private async loadDataFiles(): Promise<void> {
    this.loading.set(true);
    try {
      this.dataFiles.set(await this.adminApi.getDataFileList());
      this.status.set('Loaded data files.');
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadImages(): Promise<void> {
    try {
      this.images.set(await this.adminApi.getImages());
    } catch (error) {
      this.error.set((error as Error).message);
    }
  }

  async selectFile(fileName: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.selectedFile.set(fileName);
    try {
      const content = await this.adminApi.getDataFile(fileName);
      try {
        const parsed = JSON.parse(content);
        this.fileContent.set(JSON.stringify(parsed, null, 2));
      } catch {
        this.fileContent.set(content);
      }
      this.status.set(`Loaded ${fileName}.`);
    } catch (error) {
      console.error(error);
      this.error.set((error as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  async saveFile(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.status.set(null);

    try {
      JSON.parse(this.fileContent());
      await this.adminApi.saveDataFile(this.selectedFile(), this.fileContent());
      this.status.set(`${this.selectedFile()} saved successfully.`);
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  onImageFileChange(event: Event): void {
    this.error.set(null);
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | ArrayBuffer | null;
      if (typeof result === 'string') {
        this.imagePreview.set(result);
      }
    };
    reader.readAsDataURL(file);
  }

  async uploadImage(): Promise<void> {
    if (!this.imagePath() || !this.imagePreview()) {
      this.error.set('Choose a target image path and a file first.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.adminApi.uploadImage({
        path: this.imagePath(),
        contentBase64: this.imagePreview()!,
      });
      this.status.set(`${this.imagePath()} uploaded.`);
      await this.loadImages();
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  getImageUrl(image: string): string {
    return buildAssetUrl(this.envConfig.assetBasePath, `assets/images/${image}`);
  }

  onFileContentInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    if (target) {
      this.fileContent.set(target.value);
    }
  }
}

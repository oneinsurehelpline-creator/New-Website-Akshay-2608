import { Component, HostListener, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { VideoModalService, VideoModalState } from './video-modal.service';

@Component({
  selector: 'app-video-modal',
  templateUrl: './video-modal.component.html',
  styleUrls: ['./video-modal.component.scss'],
})
export class VideoModalComponent implements OnDestroy {
  state: VideoModalState | null = null;
  embedUrl?: SafeResourceUrl;

  private sub: Subscription;

  constructor(private svc: VideoModalService, private sanitizer: DomSanitizer) {
    this.sub = this.svc.state$.subscribe((s) => {
      this.state = s;
      this.embedUrl = s
        ? this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${s.videoId}?autoplay=1&rel=0`
          )
        : undefined;
    });
  }

  close(): void {
    this.svc.close();
  }

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('vmodal')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.state) {
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

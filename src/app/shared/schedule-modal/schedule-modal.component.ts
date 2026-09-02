import { Component, HostListener, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ScheduleModalService } from './schedule-modal.service';

const SCHEDULE_URL = 'https://schedule.oneinsure.com/book/get-expert-guidance-web';

@Component({
  selector: 'app-schedule-modal',
  templateUrl: './schedule-modal.component.html',
  styleUrls: ['./schedule-modal.component.scss'],
})
export class ScheduleModalComponent implements OnDestroy {
  isOpen = false;
  scheduleUrl = SCHEDULE_URL;
  embedUrl: SafeResourceUrl;

  private sub: Subscription;

  constructor(private svc: ScheduleModalService, private sanitizer: DomSanitizer) {
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(SCHEDULE_URL);
    this.sub = this.svc.open$.subscribe((open) => {
      this.isOpen = open;
    });
  }

  close(): void {
    this.svc.close();
  }

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('smodal')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

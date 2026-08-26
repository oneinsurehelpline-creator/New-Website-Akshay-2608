import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface VideoModalState {
  videoId: string;
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class VideoModalService {
  private readonly stateSubject = new BehaviorSubject<VideoModalState | null>(null);
  readonly state$ = this.stateSubject.asObservable();

  open(videoId: string, title?: string): void {
    this.stateSubject.next({ videoId, title });
  }

  close(): void {
    this.stateSubject.next(null);
  }
}

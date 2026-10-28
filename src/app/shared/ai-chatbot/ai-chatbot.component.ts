import { Component, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/** Everything tweakable about the widget lives here. */
export const AI_CHATBOT_CONFIG = {
  /** Existing production AI assistant. Its server must allow this site in CSP `frame-ancestors`. */
  url: 'https://ai.oneinsure.com/',
  title: 'OneInsure AI Assistant',
  subtitle: 'Ask anything about insurance',
  label: 'Ask Saarth',
  tooltip: 'Ask Saarth, the OneInsure AI',
  /** If the frame hasn't loaded after this long, show the error / retry state. */
  loadTimeoutMs: 15000,
  /** Show the small notification dot on the launcher until it is first opened. */
  showNotificationDot: true,
};

/**
 * Floating AI chatbot launcher + panel. Renders the real ai.oneinsure.com app in an
 * iframe (lazy: nothing is requested until the visitor first opens the chat).
 * The iframe is kept alive after minimise/close so the conversation isn't lost.
 */
@Component({
  selector: 'app-ai-chatbot',
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss'],
})
export class AiChatbotComponent implements OnDestroy {
  readonly cfg = AI_CHATBOT_CONFIG;
  readonly safeUrl: SafeResourceUrl;

  open = false;
  /** Iframe is only created after first open. */
  activated = false;
  loading = true;
  failed = false;
  unseen = AI_CHATBOT_CONFIG.showNotificationDot;

  @ViewChild('launcher') launcher?: ElementRef<HTMLButtonElement>;
  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;

  private timer?: ReturnType<typeof setTimeout>;
  private readonly browser: boolean;

  constructor(sanitizer: DomSanitizer, @Inject(PLATFORM_ID) platformId: object) {
    this.browser = isPlatformBrowser(platformId);
    this.safeUrl = sanitizer.bypassSecurityTrustResourceUrl(AI_CHATBOT_CONFIG.url);
  }

  toggle(): void {
    this.open ? this.close() : this.show();
  }

  show(): void {
    this.open = true;
    this.unseen = false;
    if (!this.activated) {
      this.activated = true;
      this.startLoad();
    }
    if (this.browser) {
      if (window.matchMedia('(max-width: 640px)').matches) document.body.classList.add('ai-chat-open');
      setTimeout(() => this.closeBtn?.nativeElement.focus(), 50);
    }
  }

  /** Hide the panel but keep the iframe alive, so the launcher reopens the same conversation. */
  minimize(): void {
    this.hide();
  }

  /** Hide the panel and discard the conversation; the next open starts a fresh chat. */
  close(): void {
    this.activated = false;
    this.failed = false;
    clearTimeout(this.timer);
    this.hide();
  }

  private hide(): void {
    this.open = false;
    if (this.browser) {
      document.body.classList.remove('ai-chat-open');
      setTimeout(() => this.launcher?.nativeElement.focus(), 0);
    }
  }

  onLoaded(): void {
    clearTimeout(this.timer);
    this.loading = false;
  }

  retry(): void {
    this.failed = false;
    this.activated = false;
    // Re-create the iframe on the next tick so the browser issues a fresh request.
    setTimeout(() => {
      this.activated = true;
      this.startLoad();
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    if (this.browser) document.body.classList.remove('ai-chat-open');
  }

  private startLoad(): void {
    this.loading = true;
    this.failed = false;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.failed = true;
      }
    }, this.cfg.loadTimeoutMs);
  }
}

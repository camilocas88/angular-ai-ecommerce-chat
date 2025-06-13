import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TOASTS_COMPONENTS } from '@ngx-templates/shared/toasts';

import { CategoriesService } from './data-access/categories.service';
import { ChatWrapperComponent } from './shared/chat/chat-wrapper.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { LoaderService } from './shared/loader.service';
import { LoaderComponent } from './shared/loader/loader.component';
import { LoadingComponent } from './shared/loading/loading.component';

@Component({
  selector: 'ec-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    TOASTS_COMPONENTS,
    ChatWrapperComponent,
    LoadingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit {
  categories = inject(CategoriesService);
  loader = inject(LoaderService);
  private platformId = inject(PLATFORM_ID);

  // Chat resize functionality
  chatOpen = signal(false);
  chatMaximized = signal(false);
  chatContainer = viewChild<ElementRef>('chatContainer');

  private isResizing = false;
  private resizeDirection = '';
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private startLeft = 0;
  private startTop = 0;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.categories.loadCategories();

    // Solo cargar configuraciones en el navegador
    if (this.isBrowser) {
      this.loadChatSettings();
      this.detectLostChat();
    }
  }

  ngAfterViewInit(): void {
    // Verificar que el chat esté visible después de cargar (solo en navegador)
    if (this.isBrowser) {
      setTimeout(() => {
        this.ensureChatIsVisible();
      }, 100);
    }
  }

  toggleChat() {
    this.chatOpen.update(open => !open);
    if (this.isBrowser) {
      this.saveChatSettings();
    }
  }

  toggleMaximize() {
    this.chatMaximized.update(max => !max);
    this.applyChatSize();
    if (this.isBrowser) {
      this.saveChatSettings();
    }
  }

  startResize(direction: string, event: MouseEvent) {
    if (!this.isBrowser) return;

    event.preventDefault();
    this.isResizing = true;
    this.resizeDirection = direction;

    const container = this.chatContainer()?.nativeElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.startLeft = rect.left;
    this.startTop = rect.top;

    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.body.style.cursor = this.getCursor(direction);
    document.body.style.userSelect = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing || !this.isBrowser) return;

    const container = this.chatContainer()?.nativeElement;
    if (!container) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newLeft = this.startLeft;
    let newTop = this.startTop;

    // Aplicar cambios según la dirección
    if (this.resizeDirection.includes('e')) {
      newWidth = Math.max(300, Math.min(800, this.startWidth + deltaX));
    }
    if (this.resizeDirection.includes('w')) {
      newWidth = Math.max(300, Math.min(800, this.startWidth - deltaX));
      newLeft = this.startLeft + deltaX;
    }
    if (this.resizeDirection.includes('s')) {
      newHeight = Math.max(300, Math.min(window.innerHeight * 0.9, this.startHeight + deltaY));
    }
    if (this.resizeDirection.includes('n')) {
      newHeight = Math.max(300, Math.min(window.innerHeight * 0.9, this.startHeight - deltaY));
      newTop = this.startTop + deltaY;
    }

    // SAFEGUARDS: Evitar que el chat se mueva fuera del viewport
    const maxLeft = window.innerWidth - 100; // Mínimo 100px visible
    const maxTop = window.innerHeight - 100; // Mínimo 100px visible

    newLeft = Math.max(-newWidth + 100, Math.min(maxLeft, newLeft));
    newTop = Math.max(0, Math.min(maxTop, newTop));

    container.style.width = newWidth + 'px';
    container.style.height = newHeight + 'px';
    container.style.left = newLeft + 'px';
    container.style.top = newTop + 'px';
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (!this.isResizing || !this.isBrowser) return;

    this.isResizing = false;
    this.resizeDirection = '';
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));

    this.saveChatSettings();
  }

  // Método para resetear la posición del chat
  resetChatPosition() {
    const container = this.chatContainer()?.nativeElement;
    if (!container || typeof container.style === 'undefined') {
      console.warn('⚠️ Cannot reset chat position - invalid container');
      return;
    }

    try {
      // Resetear a posición por defecto
      container.style.width = '350px';
      container.style.height = this.chatOpen() ? '500px' : '52px';
      container.style.left = '';
      container.style.top = '';
      container.style.right = '0'; // Cambio de 2rem a 0
      container.style.bottom = '0';

      this.chatMaximized.set(false);
      if (this.isBrowser) {
        this.saveChatSettings();
      }

      console.log('✅ Chat position reset successfully');
    } catch (error) {
      console.error('❌ Error resetting chat position:', error);
    }
  }

  // Detectar si el chat está fuera del viewport
  @HostListener('window:resize')
  onWindowResize() {
    if (this.isBrowser) {
      this.ensureChatIsVisible();
    }
  }

  private ensureChatIsVisible() {
    if (!this.isBrowser) return;

    const container = this.chatContainer()?.nativeElement;
    if (!container || typeof container.getBoundingClientRect !== 'function') {
      console.log('⚠️ Chat container not available or not a DOM element');
      return;
    }

    try {
      const rect = container.getBoundingClientRect();

      // Si el chat está completamente fuera del viewport, resetear
      if (rect.right < 100 || rect.left > window.innerWidth - 100 ||
          rect.bottom < 100 || rect.top > window.innerHeight - 100) {
        console.log('🔄 Chat fuera del viewport, reseteando posición...');
        this.resetChatPosition();
      }
    } catch (error) {
      console.warn('⚠️ Error checking chat visibility:', error);
    }
  }

  private getCursor(direction: string): string {
    const cursors: { [key: string]: string } = {
      'n': 'n-resize',
      'ne': 'ne-resize',
      'e': 'e-resize',
      'se': 'se-resize',
      's': 's-resize',
      'sw': 'sw-resize',
      'w': 'w-resize',
      'nw': 'nw-resize'
    };
    return cursors[direction] || 'default';
  }

  private applyChatSize() {
    if (!this.isBrowser) return;

    const container = this.chatContainer()?.nativeElement;
    if (!container) return;

    if (this.chatMaximized()) {
      container.style.width = '80vw';
      container.style.height = '80vh';
      container.style.left = '10vw';
      container.style.top = '10vh';
    } else {
      container.style.width = '350px';
      container.style.height = this.chatOpen() ? '500px' : '52px';
      container.style.left = '';
      container.style.top = '';
    }
  }

  private loadChatSettings() {
    if (!this.isBrowser) {
      console.log('⚠️ localStorage not available (SSR)');
      return;
    }

    try {
      const saved = localStorage.getItem('chatSettings');
      if (saved) {
        const settings = JSON.parse(saved);

        // Validar que las configuraciones sean válidas
        if (typeof settings.open === 'boolean') {
          this.chatOpen.set(settings.open);
        }
        if (typeof settings.maximized === 'boolean') {
          this.chatMaximized.set(settings.maximized);
        }

        // Si hay posición guardada, validar que esté dentro del viewport
        if (settings.position) {
          const container = this.chatContainer()?.nativeElement;
          if (container && this.isPositionValid(settings.position)) {
            container.style.left = settings.position.left + 'px';
            container.style.top = settings.position.top + 'px';
            container.style.width = settings.position.width + 'px';
            container.style.height = settings.position.height + 'px';
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error cargando configuración del chat:', error);
      // Si hay error, usar configuración por defecto
      this.resetChatPosition();
    }
  }

  private isPositionValid(position: any): boolean {
    if (!this.isBrowser || !position || typeof position !== 'object') return false;

    const { left, top, width, height } = position;

    // Verificar que los valores sean números válidos
    if (typeof left !== 'number' || typeof top !== 'number' ||
        typeof width !== 'number' || typeof height !== 'number') {
      return false;
    }

    // Verificar que la posición esté al menos parcialmente visible
    const rightEdge = left + width;
    const bottomEdge = top + height;

    const isVisible = (
      rightEdge > 100 && // Al menos 100px visibles desde la izquierda
      left < window.innerWidth - 100 && // Al menos 100px visibles desde la derecha
      bottomEdge > 100 && // Al menos 100px visibles desde arriba
      top < window.innerHeight - 100 // Al menos 100px visibles desde abajo
    );

    return isVisible;
  }

  private saveChatSettings() {
    if (!this.isBrowser) {
      return; // No guardar en SSR
    }

    try {
      const container = this.chatContainer()?.nativeElement;
      const settings: any = {
        open: this.chatOpen(),
        maximized: this.chatMaximized(),
      };

      // Guardar posición solo si está customizada y tenemos un elemento válido
      if (container && typeof container.getBoundingClientRect === 'function') {
        const rect = container.getBoundingClientRect();
        const hasCustomPosition = container.style.left || container.style.top;

        if (hasCustomPosition) {
          settings.position = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          };
        }
      }

      localStorage.setItem('chatSettings', JSON.stringify(settings));
    } catch (error) {
      console.warn('⚠️ Error guardando configuración del chat:', error);
    }
  }

  private detectLostChat() {
    if (!this.isBrowser) return;

    // Verificar después de que el DOM esté listo
    setTimeout(() => {
      const container = this.chatContainer()?.nativeElement;
      if (!container || typeof container.getBoundingClientRect !== 'function') {
        console.log('⚠️ Chat container no encontrado o no es un elemento DOM válido');
        return;
      }

      try {
        const rect = container.getBoundingClientRect();

        // Detectar si el chat está completamente fuera del viewport
        const isCompletelyHidden = (
          rect.right <= 0 ||
          rect.left >= window.innerWidth ||
          rect.bottom <= 0 ||
          rect.top >= window.innerHeight
        );

        if (isCompletelyHidden) {
          console.log('🔄 Chat detectado fuera del viewport, reseteando...');
          this.resetChatPosition();
        }
      } catch (error) {
        console.warn('⚠️ Error detecting lost chat:', error);
      }
    }, 500);
  }
}

import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { Action, ActionExecutor } from './action-executor';

interface ChatMessage {
  text: string;
  by: 'user' | 'bot';
  html?: SafeHtml;
}

interface Response {
  message: string;
  action?: Action;
  userName?: string;
}

@Component({
  selector: 'ec-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="messages" #messagesContainer>
        @for (message of messages(); track message) {
        <div class="message" [class.user]="message.by === 'user'">
          <div
            class="message-content"
            [innerHTML]="message.html || message.text"
          ></div>
        </div>
        } @if (nextBotMessage.isLoading()) {
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        }
      </div>
      <div class="input-area">
        <input
          type="text"
          [(ngModel)]="userMessage"
          (keyup.enter)="sendMessage()"
          [placeholder]="getPlaceholder()"
        />
        <button (click)="sendMessage()">Send</button>
      </div>
    </div>
  `,
  styleUrl: './chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
  name = input.required<string>();
  isNewUser = input<boolean>(false);
  nameDetected = output<string>();

  protected messagesContainer = viewChild.required<ElementRef>('messagesContainer');
  protected messages = signal<ChatMessage[]>([]);
  protected userMessage = '';
  protected lastMessage = signal('');
  protected isLoading = signal(false).asReadonly();
  private hasGreeted = signal(false);

  protected nextBotMessage = httpResource<Response>(() =>
    this.lastMessage()
      ? `http://localhost:4000/api/prompt?prompt=${this.lastMessage()}&tech=angular`
      : undefined
  );

  constructor(
    private sanitizer: DomSanitizer,
    private actionExecutor: ActionExecutor
  ) {
    afterNextRender(() => {
      this.scrollToBottom();
      // Si es usuario nuevo y no hemos saludado, enviar saludo automático
      if (this.isNewUser() && !this.hasGreeted() && this.messages().length === 0) {
        console.log('🎯 [Chat] Sending auto greeting for new user');
        this.sendAutoGreeting();
      } else {
        console.log('🎯 [Chat] Skipping auto greeting:', {
          isNewUser: this.isNewUser(),
          hasGreeted: this.hasGreeted(),
          messagesLength: this.messages().length
        });
      }
    });

    effect(() => {
      const response = this.nextBotMessage.value();
      if (!response) return;

      console.log('🤖 [Chat] Received AI response:', response);
      this.addMessage(response.message, 'bot');

      // Detectar si hay un nombre en la respuesta
      if (response.userName) {
        console.log('👤 [Chat] Name detected in AI response:', response.userName);
        this.nameDetected.emit(response.userName);
      } else {
        console.log('ℹ️ [Chat] No userName in AI response');
      }

      if (response.action) {
        this.actionExecutor.executeAction(response.action);
      }
    });
  }

  private sendAutoGreeting() {
    console.log('👋 [Chat] Sending auto greeting...');
    this.hasGreeted.set(true);
    // Enviar un mensaje automático de saludo
    this.lastMessage.set('hola');
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer().nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  getPlaceholder(): string {
    if (this.isNewUser()) {
      return 'Escribe tu nombre...';
    }
    return 'Type a message...';
  }

  sendMessage() {
    const message = this.userMessage.trim();
    if (!message) return;

    console.log('📤 [Chat] Sending message:', message);
    console.log('👤 [Chat] Current user state:', {
      name: this.name(),
      isNewUser: this.isNewUser()
    });

    this.lastMessage.set(message);
    this.addMessage(message, 'user');
    this.userMessage = '';

    // CRITICAL: Si es usuario nuevo, verificar si el mensaje contiene un nombre
    if (this.isNewUser()) {
      const detectedName = this.detectNameInUserMessage(message);
      if (detectedName) {
        console.log('👤 [Chat] Name detected in user message, emitting IMMEDIATELY:', detectedName);

        // Emitir inmediatamente al wrapper para actualizar el estado
        this.nameDetected.emit(detectedName);

        // FORCE: También actualizar el placeholder inmediatamente
        setTimeout(() => {
          console.log('🔄 [Chat] Force updating placeholder after name detection');
        }, 50);
      }
    }
  }

  private detectNameInUserMessage(message: string): string | null {
    console.log('🔍 [Client] Detecting name in user message:', message);

    // Patrones para detectar nombres en mensajes del usuario
    const namePatterns = [
      /(?:mi nombre es|me llamo|soy|i am|my name is|i'm)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{1,20})/i,
      /^([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]{2,15})$/i, // Nombre simple como respuesta
      /^([a-z][a-z]{2,15})$/i, // Patrón adicional para nombres sin acentos
    ];

    for (const pattern of namePatterns) {
      const match = message.trim().match(pattern);
      if (match && match[1]) {
        const detectedName = match[1].trim();
        console.log('✅ [Client] Name pattern matched:', detectedName);

        // Validar que no sea una palabra común
        const commonWords = ['hola', 'hello', 'gracias', 'thanks', 'bien', 'good', 'mal', 'bad', 'si', 'no', 'yes', 'usuario'];
        if (!commonWords.includes(detectedName.toLowerCase()) && detectedName.length >= 2) {
          console.log('📝 [Client] Valid name detected:', detectedName);
          return detectedName;
        } else {
          console.log('❌ [Client] Name rejected (common word):', detectedName);
        }
      }
    }

    console.log('❌ [Client] No name detected in message');
    return null;
  }

  private addMessage(message: string, by: 'user' | 'bot') {
    const html = this.sanitizer.bypassSecurityTrustHtml(
      marked.parse(message) as string
    );
    this.messages.update((messages) => [
      ...messages,
      { text: message, by, html },
    ]);

    // Use requestAnimationFrame to ensure the DOM has updated
    requestAnimationFrame(() => {
      this.scrollToBottom();
    });
  }
}

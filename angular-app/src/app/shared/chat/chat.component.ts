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

  // Flag global para evitar múltiples auto-greetings
  private static hasGlobalGreeting = false;
  private hasComponentGreeted = signal(false);

  protected nextBotMessage = httpResource<Response>(() =>
    this.lastMessage()
      ? `/api/prompt?prompt=${encodeURIComponent(this.lastMessage())}&tech=angular&name=${encodeURIComponent(this.name())}`
      : undefined
  );

  constructor(
    private sanitizer: DomSanitizer,
    private actionExecutor: ActionExecutor
  ) {
    afterNextRender(() => {
      this.scrollToBottom();

      // CRITICAL: Solo enviar saludo si es usuario nuevo, no hemos saludado Y no hay mensajes
      // Y no se ha enviado un saludo global previamente
      const shouldGreet = this.isNewUser() &&
                         !this.hasComponentGreeted() &&
                         !ChatComponent.hasGlobalGreeting &&
                         this.messages().length === 0;

      if (shouldGreet) {
        console.log('🎯 [Chat] Sending auto greeting for new user');
        ChatComponent.hasGlobalGreeting = true; // Marcar globalmente
        this.hasComponentGreeted.set(true); // Marcar para este componente
        this.sendAutoGreeting();
      } else {
        console.log('🎯 [Chat] Skipping auto greeting:', {
          isNewUser: this.isNewUser(),
          hasComponentGreeted: this.hasComponentGreeted(),
          hasGlobalGreeting: ChatComponent.hasGlobalGreeting,
          messagesLength: this.messages().length
        });
      }
    });

    effect(() => {
      const response = this.nextBotMessage.value();
      if (!response) return;

      console.log('🤖 [Chat] Received AI response:', response);
      this.addMessage(response.message, 'bot');

      // MEJORADO: Solo detectar nombres si realmente hay un userName Y es diferente al actual
      if (response.userName && response.userName !== this.name() && response.userName !== 'Usuario') {
        console.log('👤 [Chat] Valid name detected in AI response:', response.userName);
        this.nameDetected.emit(response.userName);
      } else {
        console.log('ℹ️ [Chat] No valid userName in AI response or same as current:', {
          responseUserName: response.userName,
          currentName: this.name()
        });
      }

      if (response.action) {
        this.actionExecutor.executeAction(response.action);
      }
    });
  }

  private sendAutoGreeting() {
    console.log('👋 [Chat] Sending auto greeting...');
    // Enviar un mensaje automático de saludo
    this.lastMessage.set('hola');
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer().nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  getPlaceholder(): string {
    if (this.isNewUser()) {
      return 'Escribe tu nombre o di hola...';
    }
    return `Hola ${this.name()}, ¿en qué puedo ayudarte?`;
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

    // MEJORADO: Solo detectar nombres en mensajes de usuarios nuevos Y que no sean saludos simples
    if (this.isNewUser() && !this.isSimpleGreeting(message)) {
      const detectedName = this.detectNameInUserMessage(message);
      if (detectedName && detectedName !== 'Usuario') {
        console.log('👤 [Chat] Name detected in user message, emitting:', detectedName);
        this.nameDetected.emit(detectedName);
      }
    }
  }

  private isSimpleGreeting(message: string): boolean {
    const greetings = ['hola', 'hello', 'hi', 'hey', 'buenos días', 'buenas tardes', 'buenas noches'];
    const lowerMessage = message.toLowerCase().trim();
    return greetings.includes(lowerMessage);
  }

  private detectNameInUserMessage(message: string): string | null {
    console.log('🔍 [Client] Detecting name in user message:', message);

    // Patrones mejorados para detectar nombres
    const namePatterns = [
      /(?:mi nombre es|me llamo|soy|i am|my name is|i'm)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{1,20})/i,
      /^([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]{2,15})$/i, // Nombre simple como respuesta
    ];

    for (const pattern of namePatterns) {
      const match = message.trim().match(pattern);
      if (match && match[1]) {
        const detectedName = match[1].trim();
        console.log('✅ [Client] Name pattern matched:', detectedName);

        // Lista expandida de palabras a evitar
        const commonWords = [
          'hola', 'hello', 'gracias', 'thanks', 'bien', 'good', 'mal', 'bad',
          'si', 'no', 'yes', 'usuario', 'ayuda', 'help', 'producto', 'productos',
          'comprar', 'precio', 'caro', 'barato', 'angular', 'react'
        ];

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

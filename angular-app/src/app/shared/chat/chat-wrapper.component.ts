import { httpResource } from "@angular/common/http";
import { Component, computed, signal } from "@angular/core";
import { LoadingComponent } from "../loading/loading.component";
import { ChatComponent } from "./chat.component";

interface UserInfo {
  name: string;
  email: string;
  isNewUser: boolean;
  conversationCount: number;
}

@Component({
  selector: 'ec-chat-wrapper',
  standalone: true,
  imports: [ChatComponent, LoadingComponent],
  template: `
    @if (!userResource.isLoading()) {
      <ec-chat
        [name]="currentUser().name"
        [isNewUser]="currentUser().isNewUser"
        (nameDetected)="onNameDetected($event)" />
    } @else {
      <ec-loading message="Loading user profile..." />
    }
`,
  styles: `
    :host {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    ec-chat {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    ec-loading {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `
})
export class ChatWrapperComponent {
  userResource = httpResource<UserInfo>(() => '/api/user');

  // Signal local para el estado del usuario que se actualiza inmediatamente
  private localUserOverride = signal<UserInfo | null>(null);

  // Flag para evitar múltiples actualizaciones del mismo nombre
  private isUpdatingName = signal(false);

  // Computed que devuelve el usuario local si existe, sino el del resource
  currentUser = computed(() => {
    const override = this.localUserOverride();
    if (override) {
      console.log('📊 [Wrapper] Using local user override:', override);
      return override;
    }

    const resourceUser = this.userResource.value();
    if (resourceUser) {
      console.log('📊 [Wrapper] Using resource user:', resourceUser);
      return resourceUser;
    }

    // Fallback
    return {
      name: 'Usuario',
      email: 'usuario@example.com',
      isNewUser: true,
      conversationCount: 0
    };
  });

  onNameDetected(name: string) {
    // Evitar actualizaciones duplicadas o si ya estamos actualizando
    if (this.isUpdatingName() || this.currentUser().name === name) {
      console.log('🚫 [Wrapper] Skipping name update - already updating or same name:', name);
      return;
    }

    console.log('👤 [Wrapper] Name detected event received:', name);
    this.isUpdatingName.set(true);

    // Actualizar inmediatamente el estado local
    const currentUser = this.userResource.value();
    if (currentUser) {
      const updatedUser: UserInfo = {
        ...currentUser,
        name: name,
        isNewUser: false // CRITICAL: Marcar como no nuevo para evitar auto-greetings
      };

      this.localUserOverride.set(updatedUser);
      console.log('🔄 [Wrapper] Updated local user state immediately:', updatedUser);
    }

    // Llamar al servidor para persistir el cambio (sin reload)
    this.updateUserName(name);
  }

  async updateUserName(name: string) {
    try {
      console.log('📝 [Wrapper] Updating user name on server:', name);

      const response = await fetch('/api/user/name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [Wrapper] Name update response from server:', result);

        // NO HACER RELOAD del resource para evitar bucles
        // this.userResource.reload(); // ← ELIMINADO para evitar bucles

        // Mantener el estado local actualizado permanentemente
        // NO limpiar el override para evitar bucles
        console.log('🔒 [Wrapper] Keeping local state, NOT reloading resource');
      } else {
        console.error('❌ [Wrapper] Failed to update name on server, status:', response.status);
        const errorText = await response.text();
        console.error('❌ [Wrapper] Error response:', errorText);

        // En caso de error, mantener el estado local (la UI ya se actualizó)
        console.log('⚠️ [Wrapper] Keeping local state despite server error');
      }
    } catch (error) {
      console.error('❌ [Wrapper] Error updating name:', error);
      // En caso de error, mantener el estado local
      console.log('⚠️ [Wrapper] Keeping local state despite network error');
    } finally {
      // Liberar el flag de actualización después de un momento
      setTimeout(() => {
        this.isUpdatingName.set(false);
        console.log('🔓 [Wrapper] Released updating flag');
      }, 1000);
    }
  }
}

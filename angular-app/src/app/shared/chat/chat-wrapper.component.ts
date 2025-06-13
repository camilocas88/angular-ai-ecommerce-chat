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
  userResource = httpResource<UserInfo>(() => 'http://localhost:4000/api/user');

  // Signal local para el estado del usuario que se actualiza inmediatamente
  private localUserOverride = signal<UserInfo | null>(null);

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
    console.log('👤 [Wrapper] Name detected event received:', name);

    // Actualizar inmediatamente el estado local
    const currentUser = this.userResource.value();
    if (currentUser) {
      const updatedUser: UserInfo = {
        ...currentUser,
        name: name,
        isNewUser: false
      };

      this.localUserOverride.set(updatedUser);
      console.log('🔄 [Wrapper] Updated local user state immediately:', updatedUser);
    }

    // Llamar al servidor para persistir el cambio
    this.updateUserName(name);
  }

  async updateUserName(name: string) {
    try {
      console.log('📝 [Wrapper] Updating user name on server:', name);

      const response = await fetch('http://localhost:4000/api/user/name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [Wrapper] Name update response from server:', result);

        // Recargar el resource para sincronizar con el servidor
        this.userResource.reload();

        // Limpiar el override local después de un momento para usar el resource actualizado
        setTimeout(() => {
          console.log('🔄 [Wrapper] Clearing local override, using server state');
          this.localUserOverride.set(null);
        }, 100);
      } else {
        console.error('❌ [Wrapper] Failed to update name on server, status:', response.status);
        const errorText = await response.text();
        console.error('❌ [Wrapper] Error response:', errorText);

        // En caso de error, limpiar el override local
        this.localUserOverride.set(null);
      }
    } catch (error) {
      console.error('❌ [Wrapper] Error updating name:', error);
      // En caso de error, limpiar el override local
      this.localUserOverride.set(null);
    }
  }
}

import { Injectable } from "@angular/core";
import { ToastsService } from '@ngx-templates/shared/toasts';
import { ProductsApi } from "../../api/products-api.service";
import { CartService } from "../../data-access/cart.service";

export interface Action {
  type: 'add_to_cart' | 'addToCart';
  params: {
    id?: string;
    productId?: string;
    productName?: string;
    quantity: number;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ActionExecutor {
  // Mapeo de nombres de productos a IDs
  private productNameToId: { [key: string]: string } = {
    'angular t-shirt': '6631',
    'angular sweatshirt': '2372',
    'angular stickers': '3936',
    'angular mug': '1002',
    'pixel 8 pro': '5551',
    'google i/o t-shirt': '9925',
    'google play $25 gift card': '8013',
    'google play $50 gift card': '9231'
  };

  constructor(
    private cartService: CartService,
    private productsApi: ProductsApi,
    private toastsService: ToastsService
  ) {}

  async executeAction(action: Action) {
    console.log('🔧 [ActionExecutor] Executing action:', action);
    console.log('🔧 [ActionExecutor] Action type:', action.type);
    console.log('🔧 [ActionExecutor] Action params:', action.params);

    try {
      switch (action.type) {
        case 'addToCart':
        case 'add_to_cart':
          console.log('🛒 [ActionExecutor] Processing add to cart action');
          await this.handleAddToCart(action.params);
          break;
        default:
          console.warn('⚠️ [ActionExecutor] Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('❌ [ActionExecutor] Error executing action:', error);
      this.toastsService.create('Error agregando producto al carrito. Inténtalo de nuevo.');
    }
  }

  private async handleAddToCart(params: {
    id?: string;
    productId?: string;
    productName?: string;
    quantity: number;
  }) {
    console.log('🛒 [ActionExecutor] handleAddToCart called with params:', params);

    // Intentar obtener el ID del producto de varias formas
    let productId = params.productId || params.id;

    // Si no tenemos ID pero tenemos nombre, intentar obtener el ID por nombre
    if (!productId && params.productName) {
      const normalizedName = params.productName.toLowerCase().trim();
      productId = this.productNameToId[normalizedName];
      console.log(`🔍 [ActionExecutor] Looking up product ID by name "${normalizedName}": ${productId}`);
    }

    if (!productId) {
      console.error('❌ [ActionExecutor] Could not determine product ID from params:', params);
      this.toastsService.create('Error: No se pudo identificar el producto.');
      return;
    }

    console.log(`🛒 [ActionExecutor] Adding to cart: Product ID ${productId}, Quantity: ${params.quantity}`);

    try {
      // Obtener el producto
      const product = await this.productsApi.getProduct(productId);
      console.log('📦 Product found:', product?.name);

      if (!product || !product.id) {
        console.error('❌ Product not found for ID:', productId);
        this.toastsService.create(`Lo siento, no pude encontrar el producto especificado.`);
        return;
      }

      // Validar la cantidad
      const quantity = Math.max(1, Math.min(params.quantity || 1, 10));

      // Agregar al carrito
      this.cartService.addToCart(product, quantity);
      console.log('✅ Product added to cart successfully');

      // Mostrar notificación de éxito y mensaje de seguimiento
      this.toastsService.create(
        `¡${product.name} agregado al carrito! (Cantidad: ${quantity})`
      );

      // Agregar un mensaje de seguimiento después de un breve delay
      setTimeout(() => {
        this.toastsService.create(
          `¿Te interesa algo más? Tenemos muchos otros productos increíbles que podrían gustarte 😊`
        );
      }, 2000);

    } catch (error) {
      console.error('❌ Error in handleAddToCart:', error);
      this.toastsService.create('Error al agregar el producto al carrito. Por favor, inténtalo de nuevo.');
      throw error;
    }
  }
}

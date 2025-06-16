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
  constructor(
    private cartService: CartService,
    private productsApi: ProductsApi,
    private toastsService: ToastsService
  ) {}

  async executeAction(action: Action) {
    console.log('🔧 Executing action:', action);

    try {
      switch (action.type) {
        case 'addToCart':
        case 'add_to_cart':
          await this.handleAddToCart(action.params);
          break;
        default:
          console.warn('⚠️ Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('❌ Error executing action:', error);
      this.toastsService.create('Error agregando producto al carrito. Inténtalo de nuevo.');
    }
  }

  private async handleAddToCart(params: {
    id?: string;
    productId?: string;
    productName?: string;
    quantity: number;
  }) {
    // Determinar el ID del producto (soportar ambos formatos)
    const productId = params.productId || params.id;

    if (!productId) {
      console.error('❌ No product ID provided in params:', params);
      this.toastsService.create('Error: ID de producto no especificado.');
      return;
    }

    console.log(`🛒 Adding to cart: Product ID ${productId}, Quantity: ${params.quantity}`);
    if (params.productName) {
      console.log(`📦 Product name from AI: ${params.productName}`);
    }

    try {
      // Obtener el producto
      const product = await this.productsApi.getProduct(productId);
      console.log('📦 Product found:', product?.name);

      if (!product) {
        console.error('❌ Product not found for ID:', productId);
        this.toastsService.create(`Producto con ID ${productId} no encontrado.`);
        return;
      }

      // Agregar al carrito
      this.cartService.addToCart(product, params.quantity);
      console.log('✅ Product added to cart successfully');

      // Mostrar notificación de éxito
      this.toastsService.create(
        `¡${product.name} agregado al carrito! (Cantidad: ${params.quantity})`
      );

    } catch (error) {
      console.error('❌ Error in handleAddToCart:', error);
      this.toastsService.create('Error obteniendo información del producto.');
      throw error;
    }
  }
}

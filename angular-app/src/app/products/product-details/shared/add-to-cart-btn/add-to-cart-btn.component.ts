import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@ngx-templates/shared/button';
import { IconComponent } from '@ngx-templates/shared/icon';
import { ToastsService } from '@ngx-templates/shared/toasts';

import { Product } from '../../../../../models';
import { CartService } from '../../../../data-access/cart.service';
import { maxProductQuantity } from '../../../../shared/utils/max-quantity';

@Component({
  selector: 'ec-add-to-cart-btn',
  imports: [ReactiveFormsModule, ButtonComponent, IconComponent],
  templateUrl: './add-to-cart-btn.component.html',
  styleUrl: './add-to-cart-btn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToCartBtnComponent implements OnInit {
  private _cart = inject(CartService);
  private _formBuilder = inject(FormBuilder);
  private _toasts = inject(ToastsService);

  product = input.required<Product>();
  isUnavailable = computed(() => this.product().availability === 'none');
  maxQuantity = computed(() => maxProductQuantity(this.product()));

  form = this._formBuilder.group({
    quantity: [1, [Validators.min(1)]],
  });

  ngOnInit() {
    this.form.controls.quantity.addValidators(
      Validators.max(this.maxQuantity()),
    );
  }

  addToCart() {
    const quantity = this.form.value.quantity || 1;
    this._cart.addToCart(this.product(), quantity);

    const currQuantity = this._cart.quantities().get(this.product().id) || 0;
    const nextQuantity = quantity + currQuantity;

    if (nextQuantity <= this.maxQuantity()) {
      this._toasts.create(
        `¡${this.product().name} agregado al carrito! (Cantidad: ${quantity})`,
      );

      // Mensaje de seguimiento después de un breve delay
      setTimeout(() => {
        this._toasts.create(
          `¿Te interesa algo más? Explora más productos increíbles 😊`
        );
      }, 2000);
    } else {
      this._toasts.create(
        `Cantidad máxima de ${this.maxQuantity()} productos alcanzada.`,
      );
    }
  }
}

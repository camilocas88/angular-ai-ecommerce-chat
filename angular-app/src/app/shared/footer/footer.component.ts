import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@ngx-templates/shared/icon';
import { THEME_COMPONENTS, ThemeService } from '@ngx-templates/shared/theme';
import { VERSION } from '../version';

import { CategoriesService } from '../../data-access/categories.service';

@Component({
  selector: 'ec-footer',
  standalone: true,
  imports: [RouterLink, IconComponent, THEME_COMPONENTS],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  theme = inject(ThemeService);
  categories = inject(CategoriesService);
  version = VERSION;
}

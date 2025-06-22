import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionListComponent } from './promotion-list.component';

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [CommonModule, PromotionListComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">Promotions & Offers</h2>
            <p class="mt-1 text-purple-100">Create and manage promotional campaigns</p>
          </div>
        </div>
      </div>
      <app-promotion-list></app-promotion-list>
    </div>
  `,
  styleUrl: './promotion.component.css',
})
export class PromotionComponent {}

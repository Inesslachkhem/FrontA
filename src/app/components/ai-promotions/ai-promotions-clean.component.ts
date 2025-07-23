import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-promotions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">AI Promotions</h1>
      <p>Welcome to the AI Promotions module.</p>
      <div class="mt-4">
        <button class="bg-blue-500 text-white px-4 py-2 rounded">Generate AI Promotions</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AiPromotionsComponent {
}

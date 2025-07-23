import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiPromotionsComponent } from './ai-promotions.component';

describe('AiPromotionsComponent', () => {
  let component: AiPromotionsComponent;
  let fixture: ComponentFixture<AiPromotionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiPromotionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AiPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

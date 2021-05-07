import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PocAudioComponent } from './poc-audio.component';

describe('PocAudioComponent', () => {
  let component: PocAudioComponent;
  let fixture: ComponentFixture<PocAudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PocAudioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PocAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

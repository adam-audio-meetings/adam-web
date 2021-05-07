import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCoordinatorComponent } from './home-coordinator.component';

describe('HomeCoordinatorComponent', () => {
  let component: HomeCoordinatorComponent;
  let fixture: ComponentFixture<HomeCoordinatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeCoordinatorComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeCoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

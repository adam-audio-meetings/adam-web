import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioMeetingComponent } from './audio-meeting.component';

describe('AudioMeetingComponent', () => {
  let component: AudioMeetingComponent;
  let fixture: ComponentFixture<AudioMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioMeetingComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

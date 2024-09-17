import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGraphComponentComponent } from './user-graph-component.component';

describe('UserGraphComponentComponent', () => {
  let component: UserGraphComponentComponent;
  let fixture: ComponentFixture<UserGraphComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserGraphComponentComponent]
    });
    fixture = TestBed.createComponent(UserGraphComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

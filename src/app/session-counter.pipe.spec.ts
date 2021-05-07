import { SessionCounterPipe } from './session-counter.pipe';

describe('SessionCounterPipe', () => {
  it('create an instance', () => {
    const pipe = new SessionCounterPipe();
    expect(pipe).toBeTruthy();
  });
});

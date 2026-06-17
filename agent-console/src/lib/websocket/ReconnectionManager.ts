export class ReconnectionManager {
  private backoffDelays = [500, 1000, 2000, 4000, 8000];
  private maxDelay = 10000;
  private attemptCount = 0;
  private timeoutId: NodeJS.Timeout | null = null;

  public schedule(callback: () => void): void {
    if (this.timeoutId) {
      this.clear();
    }

    let delay = this.maxDelay;
    if (this.attemptCount < this.backoffDelays.length) {
      delay = this.backoffDelays[this.attemptCount];
    }

    console.log(`[RECONNECT_ATTEMPT] Scheduling reconnect in ${delay}ms (attempt ${this.attemptCount + 1})`);
    
    this.timeoutId = setTimeout(() => {
      this.attemptCount++;
      callback();
    }, delay);
  }

  public reset(): void {
    this.clear();
    this.attemptCount = 0;
  }

  public clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

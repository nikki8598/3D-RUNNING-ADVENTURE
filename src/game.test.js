import { describe, expect, it } from 'vitest';
import { act, createGame, startGame, tick } from './game.js';

describe('runner rules', () => {
  it('starts and constrains the runner to three lanes', () => {
    expect(createGame().status).toBe('ready');
    let game = startGame();
    game = act(game, 'left');
    game = act(game, 'left');
    expect(act(game, 'left').lane).toBe(-1);
    expect(act(game, 'right').lane).toBe(0);
  });

  it('collects coins and ends an unavoided collision', () => {
    const coins = { ...startGame(), spawnIn: 10, objects: [{ id: 1, lane: 0, z: -1.3, type: 'coin' }] };
    expect(tick(coins, 0.1).coins).toBe(1);
    const barrier = { ...startGame(), spawnIn: 10, objects: [{ id: 2, lane: 0, z: -1.3, type: 'barrier' }] };
    expect(tick(barrier, 0.1).status).toBe('over');
    expect(tick(act(barrier, 'jump'), 0.1).status).toBe('playing');
  });

  it('requires a slide for signs and ignores actions after game over', () => {
    const sign = { ...startGame(), spawnIn: 10, objects: [{ id: 3, lane: 0, z: -1.3, type: 'sign' }] };
    expect(tick(sign, 0.1).status).toBe('over');
    expect(tick(act(sign, 'slide'), 0.1).status).toBe('playing');
    const ended = tick(sign, 0.1);
    expect(act(ended, 'left')).toBe(ended);
  });

  it('ramps speed to a safe cap', () => {
    expect(tick({ ...startGame(), spawnIn: 10 }, 0.1).speed).toBeGreaterThan(12);
    expect(tick({ ...startGame(), elapsed: 100, speed: 30, spawnIn: 10 }, 0.1).speed).toBe(30);
  });
});
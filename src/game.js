export const LANES = [-1, 0, 1];

export function createGame(status = 'ready') {
  return {
    status,
    lane: 0,
    jump: 0,
    slide: 0,
    score: 0,
    coins: 0,
    speed: 12,
    elapsed: 0,
    spawnIn: 0.7,
    nextId: 0,
    objects: [],
  };
}

export const startGame = () => createGame('playing');

export function act(game, action) {
  if (game.status !== 'playing') return game;
  switch (action) {
    case 'left': return { ...game, lane: Math.max(-1, game.lane - 1) };
    case 'right': return { ...game, lane: Math.min(1, game.lane + 1) };
    case 'jump': return game.slide > 0 ? game : { ...game, jump: 0.78 };
    case 'slide': return game.jump > 0 ? game : { ...game, slide: 0.72 };
    default: return game;
  }
}

export function tick(game, seconds, random = Math.random) {
  if (game.status !== 'playing') return game;
  const dt = Math.min(seconds, 0.1);
  const elapsed = game.elapsed + dt;
  const speed = Math.min(30, 12 + elapsed * 0.32);
  let objects = game.objects
    .map((object) => ({ ...object, z: object.z + speed * dt }))
    .filter((object) => object.z < 2.5);
  let spawnIn = game.spawnIn - dt;
  let nextId = game.nextId;

  if (spawnIn <= 0) {
    const lane = LANES[Math.floor(random() * LANES.length)];
    const coins = random() < 0.42;
    const type = coins ? 'coin' : random() < 0.5 ? 'barrier' : 'sign';
    const count = coins ? 3 : 1;
    objects = objects.concat(Array.from({ length: count }, (_, index) => ({
      id: nextId++, lane, z: -32 - index * 2.1, type,
    })));
    spawnIn = Math.max(0.52, 1.2 - elapsed * 0.006) + random() * 0.48;
  }

  let collected = 0;
  let crashed = false;
  objects = objects.filter((object) => {
    if (object.lane !== game.lane || object.z < -0.8 || object.z > 0.9) return true;
    if (object.type === 'coin') {
      collected += 1;
      return false;
    }
    const avoided = object.type === 'barrier' ? game.jump > dt : game.slide > dt;
    if (!avoided) crashed = true;
    return true;
  });

  return {
    ...game,
    elapsed,
    speed,
    score: game.score + Math.floor(speed * dt),
    coins: game.coins + collected,
    jump: Math.max(0, game.jump - dt),
    slide: Math.max(0, game.slide - dt),
    objects,
    spawnIn,
    nextId,
    status: crashed ? 'over' : 'playing',
  };
}
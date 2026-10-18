import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { act, createGame, startGame, tick } from './game.js';

const laneX = (lane) => lane * 1.65;

function Runner({ lane, jump, slide }) {
  const root = useRef();
  const legs = useRef([]);
  const arms = useRef([]);
  useFrame(({ clock }, dt) => {
    if (!root.current) return;
    const phase = clock.elapsedTime * 12;
    root.current.position.x += (laneX(lane) - root.current.position.x) * Math.min(1, dt * 12);
    root.current.position.y = 0.85 + (jump > 0 ? Math.sin((0.78 - jump) / 0.78 * Math.PI) * 1.35 : 0);
    root.current.rotation.x = slide > 0 ? -0.75 : 0;
    root.current.scale.y = slide > 0 ? 0.65 : 1;
    if (slide <= 0) {
      legs.current.forEach((leg, index) => { if (leg) leg.rotation.x = Math.sin(phase + index * Math.PI) * 0.65; });
      arms.current.forEach((arm, index) => { if (arm) arm.rotation.x = Math.sin(phase + (index + 1) * Math.PI) * 0.48; });
    }
  });
  return (
    <group ref={root} position={[0, 0.85, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow><capsuleGeometry args={[0.31, 0.48, 4, 8]} /><meshStandardMaterial color="#ff5876" /></mesh>
      <mesh position={[0, 1.08, 0]} castShadow><sphereGeometry args={[0.29, 16, 12]} /><meshStandardMaterial color="#f4bf94" /></mesh>
      <mesh position={[0, 1.31, 0.015]}><sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, 1.8]} /><meshStandardMaterial color="#222849" /></mesh>
      {[-1, 1].map((side) => <mesh key={side} ref={(node) => { arms.current[(side + 1) / 2] = node; }} position={[side * 0.4, 0.55, 0]} rotation={[0, 0, side * 0.12]} castShadow><capsuleGeometry args={[0.11, 0.43, 3, 7]} /><meshStandardMaterial color="#ff5876" /></mesh>)}
      {[-1, 1].map((side) => <mesh key={side} ref={(node) => { legs.current[(side + 1) / 2] = node; }} position={[side * 0.18, 0.03, 0]} castShadow><capsuleGeometry args={[0.14, 0.43, 3, 7]} /><meshStandardMaterial color="#263459" /></mesh>)}
      <mesh position={[0, 0.58, 0.29]}><boxGeometry args={[0.23, 0.13, 0.03]} /><meshStandardMaterial color="#ffe07c" emissive="#aa5623" emissiveIntensity={0.4} /></mesh>
    </group>
  );
}

function Coin({ position }) {
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 4; });
  return <mesh ref={ref} position={position} castShadow><cylinderGeometry args={[0.29, 0.29, 0.08, 16]} /><meshStandardMaterial color="#ffda55" metalness={0.65} roughness={0.25} /></mesh>;
}

function City({ elapsed }) {
  const ties = useRef([]);
  useFrame(() => ties.current.forEach((mesh, i) => { if (mesh) mesh.position.z = ((i * 2 + elapsed * 12) % 40) - 37; }));
  return <>
    <mesh position={[0, -0.19, -14]} receiveShadow><boxGeometry args={[5.5, 0.35, 44]} /><meshStandardMaterial color="#282b50" /></mesh>
    {[-1.65, 1.65].map((x) => <mesh key={x} position={[x, 0.01, -14]}><boxGeometry args={[0.05, 0.02, 44]} /><meshBasicMaterial color="#42ead7" /></mesh>)}
    {Array.from({ length: 20 }, (_, i) => <mesh key={i} ref={(node) => { ties.current[i] = node; }} position={[0, 0.015, i * 2 - 37]}><boxGeometry args={[5.2, 0.04, 0.14]} /><meshStandardMaterial color="#454969" /></mesh>)}
    {[-1, 1].map((side) => <group key={side} position={[side * 4.2, 0, -14]}>
      <mesh position={[0, 0.6, 0]}><boxGeometry args={[3.8, 1.2, 44]} /><meshStandardMaterial color={side < 0 ? '#393661' : '#21455e'} /></mesh>
      {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[side * (i % 2) * 0.45, 1.25 + (i % 3) * 0.45, -20 + i * 6]}><boxGeometry args={[1.2 + (i % 2) * 0.55, 1.3 + (i % 3) * 0.5, 1.2]} /><meshStandardMaterial color={i % 2 ? '#df5f9c' : '#5174b5'} emissive={i % 2 ? '#41152c' : '#172449'} /></mesh>)}
      <mesh position={[side * 1.68, 0.6, 0]}><boxGeometry args={[0.1, 1.2, 44]} /><meshStandardMaterial color="#ffd074" emissive="#633b18" emissiveIntensity={0.3} /></mesh>
    </group>)}
  </>;
}

function Scene({ game }) {
  return <>
    <color attach="background" args={['#11152e']} /><fog attach="fog" args={['#11152e', 19, 52]} />
    <ambientLight intensity={1.2} /><directionalLight position={[-4, 9, 6]} intensity={2} castShadow shadow-mapSize={[512, 512]} /><pointLight position={[0, 5, -12]} color="#fa65ac" intensity={25} distance={28} />
    <City elapsed={game.elapsed} /><Runner lane={game.lane} jump={game.jump} slide={game.slide} />
    {game.objects.map((item) => {
      const position = [laneX(item.lane), item.type === 'coin' ? 1.5 : 0.7, item.z];
      if (item.type === 'coin') return <Coin key={item.id} position={position} />;
      return <group key={item.id} position={position}>
        <mesh castShadow><boxGeometry args={item.type === 'barrier' ? [1.05, 1.15, 0.65] : [1.4, 0.15, 0.3]} /><meshStandardMaterial color={item.type === 'barrier' ? '#ff765e' : '#83e6ff'} emissive={item.type === 'barrier' ? '#6b2138' : '#1b758c'} emissiveIntensity={0.35} /></mesh>
        {item.type === 'sign' && [-0.56, 0.56].map((x) => <mesh key={x} position={[x, -0.35, 0]}><boxGeometry args={[0.08, 0.7, 0.1]} /><meshStandardMaterial color="#b5f4ff" /></mesh>)}
      </group>;
    })}
  </>;
}

export default function RunnerGame() {
  const gameRef = useRef(createGame());
  const touch = useRef(null);
  const [game, setGame] = useState(gameRef.current);
  const publish = useCallback((next) => { gameRef.current = next; setGame(next); }, []);
  const runAction = useCallback((name) => publish(act(gameRef.current, name)), [publish]);
  const start = useCallback(() => publish(startGame()), [publish]);

  useEffect(() => {
    const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'jump', ArrowDown: 'slide' };
    const onKey = (event) => {
      if (keys[event.key]) { event.preventDefault(); runAction(keys[event.key]); }
      else if ((event.key === 'Enter' || event.key === ' ') && gameRef.current.status !== 'playing') { event.preventDefault(); start(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [runAction, start]);

  useEffect(() => {
    if (game.status !== 'playing') return undefined;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      publish(tick(gameRef.current, (now - last) / 1000));
      last = now;
    }, 50);
    return () => window.clearInterval(id);
  }, [game.status, publish]);

  const touchStart = (event) => {
    const point = event.changedTouches?.[0] ?? event;
    touch.current = { x: point.clientX, y: point.clientY };
  };
  const touchEnd = (event) => {
    if (!touch.current) return;
    const point = event.changedTouches?.[0] ?? event;
    const dx = point.clientX - touch.current.x;
    const dy = point.clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    runAction(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'slide' : 'jump'));
  };

  return <main className="game" onTouchStart={touchStart} onTouchEnd={touchEnd} onTouchCancel={() => { touch.current = null; }}>
    <div className="scene"><Canvas camera={{ position: [0, 4.1, 8.8], fov: 53 }} dpr={[1, 1.4]} shadows gl={{ antialias: false, powerPreference: 'high-performance' }}><Scene game={game} /></Canvas></div>
    <header className="hud">
      <div className="brand"><i>✦</i><b>NEON<br />DASH</b></div>
      <div className="stats"><div><b>{game.score.toLocaleString()}</b><small>SCORE</small></div><div><b>◉ {game.coins}</b><small>COINS</small></div></div>
      <div className="speed"><i /> {Math.round(game.speed)} KM/H</div>
    </header>
    {game.status !== 'playing' && <section className="overlay" aria-live="polite">
      <small className="eyebrow">{game.status === 'ready' ? 'THE CITY IS YOURS' : 'RUN COMPLETE'}</small>
      <h1>{game.status === 'ready' ? <>Run the<br /><span>neon line.</span></> : <>Keep your<br /><span>glow on.</span></>}</h1>
      {game.status === 'ready' ? <><p>Dodge the rush. Grab the glow.</p><div className="hints"><span>← → SWITCH</span><span>↑ JUMP</span><span>↓ SLIDE</span></div></> : <><p>You picked up {game.coins} neon coins.</p><div className="final-score">{game.score.toLocaleString()}<small>FINAL SCORE</small></div></>}
      <button className="start" onClick={start}>{game.status === 'ready' ? 'START RUN' : 'RUN IT BACK'} <b>→</b></button>
      {game.status === 'ready' && <small className="swipe-hint">Swipe to move on your phone</small>}
    </section>}
    {game.status === 'playing' && <nav className="controls" aria-label="Touch controls">
      {['left', 'jump', 'slide', 'right'].map((action) => <button key={action} aria-label={action} onClick={() => runAction(action)}>{({ left: '←', jump: '↑', slide: '↓', right: '→' })[action]}</button>)}
    </nav>}
  </main>;
}
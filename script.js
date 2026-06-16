/* ========== LOADER ========== */
window.addEventListener('load', ()=>{
  requestAnimationFrame(()=>{ document.getElementById('progressBar').style.width='100%'; });
  setTimeout(()=>{
    const l=document.getElementById('loader');
    l.style.opacity='0';
    setTimeout(()=>l.remove(),800);
    introAnim();
  },2600);
});

/* ========== SOUNDS ========== */
let audioReady=false;
let noiseSynth, thudSynth, dingSynth, failSynth, tickSynth;
function initAudio(){
  if(audioReady) return;
  audioReady=true;
  Tone.start();
  noiseSynth = new Tone.NoiseSynth({
    noise:{type:'pink'},
    envelope:{attack:.005,decay:.15,sustain:0,release:.1}
  }).toDestination();
  noiseSynth.volume.value = -18;

  thudSynth = new Tone.MembraneSynth({
    pitchDecay:.08, octaves:6,
    envelope:{attack:.001,decay:.4,sustain:0,release:.2}
  }).toDestination();
  thudSynth.volume.value = -6;

  dingSynth = new Tone.Synth({
    oscillator:{type:'triangle'},
    envelope:{attack:.005,decay:.2,sustain:.1,release:.4}
  }).toDestination();
  dingSynth.volume.value = -10;

  failSynth = new Tone.Synth({
    oscillator:{type:'sawtooth'},
    envelope:{attack:.01,decay:.3,sustain:.1,release:.4}
  }).toDestination();
  failSynth.volume.value = -14;

  tickSynth = new Tone.MembraneSynth({
    pitchDecay:.01,octaves:2,
    envelope:{attack:.001,decay:.05,sustain:0,release:.05}
  }).toDestination();
  tickSynth.volume.value = -20;
}
function playShake(){
  if(!audioReady) return;
  const n=8;
  for(let i=0;i<n;i++){
    setTimeout(()=>noiseSynth.triggerAttackRelease('16n'), i*90);
  }
}
function playThud(){ if(audioReady) thudSynth.triggerAttackRelease('C1','8n'); }
function playDing(){
  if(!audioReady) return;
  ['C5','E5','G5'].forEach((n,i)=>setTimeout(()=>dingSynth.triggerAttackRelease(n,'8n'), i*120));
}
function playFail(){
  if(!audioReady) return;
  ['A3','F3','C3'].forEach((n,i)=>setTimeout(()=>failSynth.triggerAttackRelease(n,'8n'), i*140));
}
function playTick(){ if(audioReady) tickSynth.triggerAttackRelease('C4','32n'); }

/* ========== THREE.JS DICE ========== */
const canvas = document.getElementById('diceCanvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(420,420,false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 2.2, 5.5);

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(4,8,5); dir.castShadow=true;
dir.shadow.mapSize.set(1024,1024);
scene.add(dir);
const pt = new THREE.PointLight(0xC9A84C, 1.2, 12);
pt.position.set(-3,2,3);
scene.add(pt);
const rim = new THREE.PointLight(0xffd877, 0.5, 10);
rim.position.set(3,-2,-3);
scene.add(rim);

/* Platform */
const platGeo = new THREE.CylinderGeometry(2.2,2.2,0.15,64);
const platMat = new THREE.MeshStandardMaterial({color:0x111114, roughness:.6, metalness:.3});
const platform = new THREE.Mesh(platGeo, platMat);
platform.position.y = -1.2; platform.receiveShadow=true;
scene.add(platform);
const ringGeo = new THREE.RingGeometry(2.15,2.22,128);
const ringMat = new THREE.MeshBasicMaterial({color:0xC9A84C, side:THREE.DoubleSide, transparent:true, opacity:.7});
const ringMesh = new THREE.Mesh(ringGeo, ringMat);
ringMesh.rotation.x = -Math.PI/2; ringMesh.position.y = -1.115;
scene.add(ringMesh);

/* Dice face textures */
function makeFaceTexture(num){
  const s=256;
  const c=document.createElement('canvas'); c.width=c.height=s;
  const ctx=c.getContext('2d');
  // ivory bg with subtle gradient
  const g=ctx.createRadialGradient(s/2,s/2,20,s/2,s/2,s/1.2);
  g.addColorStop(0,'#fdfaf2'); g.addColorStop(1,'#e8e1cf');
  ctx.fillStyle=g; ctx.fillRect(0,0,s,s);
  // inner border shadow
  ctx.strokeStyle='rgba(0,0,0,0.15)'; ctx.lineWidth=4;
  ctx.strokeRect(4,4,s-8,s-8);

  const dot=(x,y)=>{
    const r=22;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    const dg=ctx.createRadialGradient(x-5,y-5,2,x,y,r);
    dg.addColorStop(0,'#222'); dg.addColorStop(1,'#000');
    ctx.fillStyle=dg; ctx.fill();
    ctx.beginPath(); ctx.arc(x+6,y+6,r*0.8,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.15)'; // no-op
  };
  const p=s/4, m=s/2, q=s*3/4;
  const layouts={
    1:[[m,m]],
    2:[[p,p],[q,q]],
    3:[[p,p],[m,m],[q,q]],
    4:[[p,p],[q,p],[p,q],[q,q]],
    5:[[p,p],[q,p],[m,m],[p,q],[q,q]],
    6:[[p,p],[q,p],[p,m],[q,m],[p,q],[q,q]]
  };
  layouts[num].forEach(([x,y])=>dot(x,y));
  const tex=new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}
/* BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
   Standard die: opposite faces sum to 7.
   We'll map: +X=3, -X=4, +Y=1, -Y=6, +Z=2, -Z=5 */
const faceNums=[3,4,1,6,2,5];
const materials = faceNums.map(n => new THREE.MeshStandardMaterial({
  map: makeFaceTexture(n),
  roughness:.35, metalness:.05,
  emissive:0x000000
}));
const diceGeo = new THREE.BoxGeometry(1.6,1.6,1.6);
// soften edges
const dice = new THREE.Mesh(diceGeo, materials);
dice.castShadow=true; dice.position.y=-0.3;
scene.add(dice);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=.08;
controls.enablePan=false; controls.minDistance=4; controls.maxDistance=8;
controls.target.set(0,-0.3,0);

function resizeDiceRenderer(){
  const wrap = document.getElementById('canvasWrap');
  const size = wrap.getBoundingClientRect();
  const width = Math.max(180, Math.floor(size.width));
  const height = Math.max(180, Math.floor(size.height));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resizeDiceRenderer);
resizeDiceRenderer();

let hoverGlow=0;
canvas.addEventListener('mouseenter',()=>{ gsap.to({v:hoverGlow},{v:1,duration:.4,onUpdate:function(){hoverGlow=this.targets()[0].v}}); });
canvas.addEventListener('mouseleave',()=>{ gsap.to({v:hoverGlow},{v:0,duration:.4,onUpdate:function(){hoverGlow=this.targets()[0].v}}); });

function animate(){
  requestAnimationFrame(animate);
  controls.update();
  materials.forEach(m=>{
    m.emissive.setHex(0x000000);
    m.emissiveIntensity = 0;
  });
  if(hoverGlow>0){
    materials.forEach(m=>{
      m.emissive.setHex(0xC9A84C);
      m.emissiveIntensity = 0.15*hoverGlow;
    });
  }
  renderer.render(scene,camera);
}
animate();

/* Target rotations to land specific face UP (+Y in world) */
const faceRotations = {
  1:{x:0,y:0,z:0},
  6:{x:Math.PI,y:0,z:0},
  2:{x:-Math.PI/2,y:0,z:0},
  5:{x:Math.PI/2,y:0,z:0},
  3:{x:0,y:0,z:-Math.PI/2},
  4:{x:0,y:0,z:Math.PI/2},
};

/* ========== GAME: RACE TO 50 (Pig variant) ==========
   Rules: On your turn, keep rolling to add to TURN POT.
   Roll a 1 → bust, lose pot, turn passes to House.
   Bank → add pot to your banked score, turn passes to House.
   First to 50 wins. House auto-plays (banks at 20 or when close to win). */

const TARGET = 50;
const HOUSE_BANK_THRESHOLD = 20;
let rolling=false;
const game = {
  you:0, house:0, pot:0,
  turn:'you', // 'you' | 'house'
  over:false,
  history:[]
};

function roll(){
  if(rolling || game.over || game.turn!=='you') return;
  initAudio();
  _doRoll('you');
}

function houseRoll(){
  if(game.over || game.turn!=='house') return;
  _doRoll('house');
}

function _doRoll(who){
  rolling=true;
  const btn=document.getElementById('rollBtn');
  const bankBtn=document.getElementById('bankBtn');
  btn.disabled=true; bankBtn.disabled=true;
  if(who==='you') btn.classList.add('loading');
  playShake();

  const result = 1 + Math.floor(Math.random()*6);
  const spins = 4 + Math.floor(Math.random()*3);
  const target = faceRotations[result];

  const tl = gsap.timeline({onComplete:()=>{
    rolling=false; btn.classList.remove('loading');
    finishRoll(result, who);
  }});

  tl.to(camera.position,{z:4.6,duration:.6,ease:'power2.in'},0);
  tl.to(camera.position,{z:5.5,duration:.7,ease:'power3.out'},1.1);
  tl.to(dice.scale,{x:1.15,y:1.15,z:1.15,duration:.5,ease:'power2.out'},0);
  tl.to(dice.scale,{x:1,y:1,z:1,duration:.5,ease:'elastic.out(1,.5)'},1.3);
  tl.to(dice.rotation,{
    x: target.x + Math.PI*2*spins,
    y: target.y + Math.PI*2*(spins+1),
    z: target.z + Math.PI*2*spins,
    duration:1.8, ease:'power3.out'
  },0);
  tl.to(pt,{intensity:2.5,duration:.4,ease:'power2.out'},0);
  tl.to(pt,{intensity:1.2,duration:.6,ease:'power2.in'},1.2);

  setTimeout(()=>playThud(), 1700);
}

function finishRoll(n, who){
  dice.rotation.x = dice.rotation.x % (Math.PI*2);
  dice.rotation.y = dice.rotation.y % (Math.PI*2);
  dice.rotation.z = dice.rotation.z % (Math.PI*2);

  // glow burst
  const glowColor = (n===1)?0x8B0000:0xC9A84C;
  materials.forEach(m=>{ m.emissive.setHex(glowColor); m.emissiveIntensity=0.6; });
  gsap.to({v:0.6},{v:0,duration:1,onUpdate:function(){
    const v=this.targets()[0].v;
    materials.forEach(m=>m.emissiveIntensity=v);
  }});

  spawnSparkles();
  game.history.unshift({n, who});
  if(game.history.length>10) game.history.pop();

  if(n===1){
    // BUST
    playFail();
    game.pot=0;
    flashTurn(who==='you'?'You Busted!':'House Busts!', true);
    updateUI();
    setTimeout(()=>endTurn(), 1100);
  } else {
    game.pot += n;
    if(n===6){ playDing(); spawnConfetti(); }
    updateUI();
    pulsePot();

    // auto-win check (banked + pot would win is allowed only on bank, but roll alone won't win)
    if(who==='house'){
      // House AI: keep rolling unless threshold reached, or about to win
      const wouldWin = game.house + game.pot >= TARGET;
      const shouldBank = wouldWin || game.pot >= HOUSE_BANK_THRESHOLD;
      setTimeout(()=>{
        if(shouldBank) bankFor('house');
        else houseRoll();
      }, 900);
    } else {
      // re-enable player controls
      document.getElementById('rollBtn').disabled=false;
      document.getElementById('bankBtn').disabled=false;
    }
  }
}

function bank(){
  if(rolling || game.over || game.turn!=='you' || game.pot===0) return;
  initAudio(); playTick();
  bankFor('you');
}

function bankFor(who){
  game[who] += game.pot;
  game.pot = 0;
  updateUI();
  if(game[who] >= TARGET){
    game.over=true;
    showWin(who);
    return;
  }
  endTurn();
}

function endTurn(){
  game.pot=0;
  game.turn = (game.turn==='you')?'house':'you';
  updateUI();
  flashTurn(game.turn==='you'?'Your Turn':"House's Turn", false);
  if(game.turn==='house'){
    document.getElementById('rollBtn').disabled=true;
    document.getElementById('bankBtn').disabled=true;
    setTimeout(()=>houseRoll(), 1000);
  } else {
    document.getElementById('rollBtn').disabled=false;
    document.getElementById('bankBtn').disabled=true; // can't bank with 0
  }
}

function flashTurn(msg, bust){
  const el=document.getElementById('turnIndicator');
  el.textContent=msg;
  el.classList.toggle('bust', !!bust);
  gsap.fromTo(el,{y:-8,opacity:0},{y:0,opacity:1,duration:.5,ease:'power3.out'});
}
function pulsePot(){
  gsap.fromTo('#turnPot',{scale:1.4,color:'#fff'},{scale:1,color:'#F0EDE8',duration:.6,ease:'power3.out'});
}

function updateUI(){
  document.getElementById('scoreYou').textContent = game.you;
  document.getElementById('scoreHouse').textContent = game.house;
  document.getElementById('turnPot').textContent = game.pot;
  document.getElementById('cardYou').classList.toggle('active', game.turn==='you' && !game.over);
  document.getElementById('cardHouse').classList.toggle('active', game.turn==='house' && !game.over);
  document.getElementById('bankBtn').disabled = (game.turn!=='you' || game.pot===0 || rolling || game.over);
  document.getElementById('rollBtn').disabled = (game.turn!=='you' || rolling || game.over);

  const h=document.getElementById('history'); h.innerHTML='';
  game.history.forEach(({n,who})=>{
    const c=document.createElement('div');
    c.className='chip'+(n===6?' gold':n===1?' red':'');
    c.textContent=n;
    c.title=(who==='you'?'You':'House')+' rolled '+n;
    if(who==='house') c.style.opacity='.55';
    h.appendChild(c);
  });
}

function showWin(winner){
  const modal=document.getElementById('modal');
  const card=modal.querySelector('.modal-card');
  const title=document.getElementById('modalTitle');
  const sub=document.getElementById('modalSub');
  if(winner==='you'){
    card.classList.remove('lose');
    title.textContent='Victory';
    sub.textContent='You have outrolled the House.';
    playDing(); setTimeout(()=>{spawnConfetti();spawnConfetti();},200);
  } else {
    card.classList.add('lose');
    title.textContent='Defeat';
    sub.textContent='The House claims this round.';
    playFail();
  }
  modal.classList.add('show');
}

function resetGame(){
  game.you=0; game.house=0; game.pot=0;
  game.turn='you'; game.over=false; game.history=[];
  document.getElementById('modal').classList.remove('show');
  updateUI();
  flashTurn('Your Turn', false);
}

document.getElementById('rollBtn').addEventListener('click',()=>{ initAudio(); playTick(); roll(); });
document.getElementById('bankBtn').addEventListener('click',()=>{ bank(); });
document.getElementById('resetBtn').addEventListener('click',()=>{ playTick(); resetGame(); });
document.getElementById('modalBtn').addEventListener('click',()=>{ playTick(); resetGame(); });

// initial UI
updateUI();

/* ========== PARTICLES ========== */
const pCanvas=document.getElementById('particleCanvas');
const pCtx=pCanvas.getContext('2d');
function sizePCanvas(){
  const r=pCanvas.getBoundingClientRect();
  pCanvas.width=r.width*devicePixelRatio;
  pCanvas.height=r.height*devicePixelRatio;
  pCtx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
sizePCanvas();
window.addEventListener('resize',sizePCanvas);

const particles=[];
function spawnConfetti(){
  const w=pCanvas.clientWidth, h=pCanvas.clientHeight;
  for(let i=0;i<55;i++){
    const a=Math.random()*Math.PI*2;
    const sp=2+Math.random()*5;
    particles.push({
      x:w/2,y:h/2,
      vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1,
      g:.12, life:1, decay:.012+Math.random()*.008,
      size:2+Math.random()*4,
      color: Math.random()<0.3 ? '#8B0000' : (Math.random()<0.5?'#C9A84C':'#e3c878'),
      rot:Math.random()*Math.PI, vr:(Math.random()-.5)*.2
    });
  }
}
function spawnSparkles(){
  const w=pCanvas.clientWidth, h=pCanvas.clientHeight;
  for(let i=0;i<18;i++){
    const a=Math.random()*Math.PI*2;
    const sp=.5+Math.random()*1.5;
    particles.push({
      x:w/2+(Math.random()-.5)*60,y:h/2+(Math.random()-.5)*40,
      vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-.3,
      g:.02, life:1, decay:.02,
      size:1+Math.random()*2, color:'#fff8d6', spark:true,
      rot:0,vr:0
    });
  }
}
function tickParticles(){
  pCtx.clearRect(0,0,pCanvas.clientWidth,pCanvas.clientHeight);
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.vy+=p.g; p.x+=p.vx; p.y+=p.vy;
    p.life-=p.decay; p.rot+=p.vr;
    if(p.life<=0){particles.splice(i,1);continue}
    pCtx.save();
    pCtx.globalAlpha=Math.max(0,p.life);
    pCtx.translate(p.x,p.y); pCtx.rotate(p.rot);
    if(p.spark){
      pCtx.fillStyle=p.color;
      pCtx.shadowColor=p.color; pCtx.shadowBlur=8;
      pCtx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
    } else {
      pCtx.fillStyle=p.color;
      pCtx.shadowColor=p.color; pCtx.shadowBlur=10;
      pCtx.fillRect(-p.size,-p.size/2,p.size*2,p.size);
    }
    pCtx.restore();
  }
  requestAnimationFrame(tickParticles);
}
tickParticles();

/* ========== INTRO ========== */
function introAnim(){
  try {
    gsap.from('.title',{y:-30,opacity:0,duration:1,ease:'power3.out'});
    gsap.from('.subtitle',{y:-10,opacity:0,duration:.8,delay:.3,ease:'power2.out'});
    gsap.from('.scoreboard',{y:-15,opacity:0,duration:.8,delay:.4,ease:'power2.out'});
    gsap.from('#canvasWrap',{scale:.7,opacity:0,duration:1.1,delay:.6,ease:'back.out(1.4)'});
    if (typeof dice !== 'undefined' && dice && dice.rotation) {
      gsap.from(dice.rotation,{x:Math.PI*4,y:Math.PI*4,duration:1.6,delay:.6,ease:'power3.out'});
    }
  } catch(e){ console.warn('intro anim skipped', e); }
}

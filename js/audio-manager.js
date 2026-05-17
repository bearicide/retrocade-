window.RetroAudio=(function(){
  let ctx=null;
  let master=null;
  let music=null;
  let ambience=null;
  let ui=null;
  let fx=null;
  const cooldowns={};
  const state={muted:false,enabled:false,ready:false};

  function init(){
    if(ctx)return true;
    const AudioCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtor)return false;
    ctx=new AudioCtor();
    master=ctx.createGain();
    music=ctx.createGain();
    ambience=ctx.createGain();
    ui=ctx.createGain();
    fx=ctx.createGain();
    master.gain.value=.72;
    music.gain.value=.42;
    ambience.gain.value=.22;
    ui.gain.value=.7;
    fx.gain.value=.82;
    music.connect(master);
    ambience.connect(master);
    ui.connect(master);
    fx.connect(master);
    master.connect(ctx.destination);
    state.ready=true;
    return true;
  }

  function unlock(){
    if(!init())return;
    if(ctx.state==='suspended')ctx.resume();
    state.enabled=true;
  }

  function tone(type='sine',freq=220,duration=.08,groupName='ui',volume=.05){
    if(state.muted)return;
    unlock();
    if(!ctx)return;
    const group={music,ambience,ui,fx}[groupName]||ui;
    const now=ctx.currentTime;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type=type;
    osc.frequency.value=freq;
    gain.gain.value=volume;
    osc.connect(gain);
    gain.connect(group);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.start(now);
    osc.stop(now+duration);
  }

  function click(){tone('square',420,.04,'ui',.04)}
  function hover(){tone('triangle',640,.03,'ui',.018)}
  function confirm(){tone('sawtooth',220,.09,'ui',.05);setTimeout(()=>tone('square',420,.06,'ui',.03),40)}
  function gameOver(){tone('sawtooth',180,.3,'fx',.08);setTimeout(()=>tone('triangle',120,.45,'fx',.06),120)}
  function bigWin(){for(let i=0;i<4;i++){setTimeout(()=>tone('square',300+(i*140),.12,'fx',.05),i*70)}}
  function ambientHum(){if(cooldowns.hum&&Date.now()-cooldowns.hum<12000)return;cooldowns.hum=Date.now();tone('sine',58,2.4,'ambience',.012);setTimeout(()=>tone('triangle',64,1.8,'ambience',.008),400)}

  setInterval(()=>{if(!document.hidden&&state.enabled)ambientHum()},9000);
  document.addEventListener('pointerdown',unlock,{once:true});
  document.addEventListener('keydown',unlock,{once:true});
  document.addEventListener('pointerover',e=>{if(e.target.closest('button,.touch-btn,.arcade-btn'))hover()});
  document.addEventListener('pointerdown',e=>{if(e.target.closest('button,.touch-btn,.arcade-btn'))click()});

  return{click,hover,confirm,gameOver,bigWin,unlock,state};
})();
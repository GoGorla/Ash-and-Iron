const $=s=>document.querySelector(s),r=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[r(0,a.length-1)];
const PACE=1; // raise to shorten the game (2 = half the grind), lower to lengthen
const KEY="ashiron_v1";
const fresh=()=>({act:0,food:6,coin:0,intel:0,fame:0,heat:0,rep:{Commoners:0,Soldiers:0,Merchants:0,Clergy:0,Nobility:0},crew:[],fl:{},qi:0,cd:{},built:{},tab:"journal",log:["Rain. Mud. A ridge full of the dead."],end:null});
let S;try{S=JSON.parse(localStorage[KEY])}catch(e){}S=S||fresh();
let open=false;
const save=()=>{try{localStorage[KEY]=JSON.stringify(S)}catch(e){}};
const say=t=>{S.log.unshift(t);S.log=S.log.slice(0,30)};
const ACTS=["The Ridge","Greyhaven","The Weight of Letters","Black Hollow","Banner of the Broken","Crown of Ash"];
function g(e){for(const k in e){const v=e[k];
 if(k=="rep")for(const x in v)S.rep[x]+=v[x];
 else if(k=="fl")Object.assign(S.fl,v);
 else if(k=="crew")v.forEach(c=>S.crew.includes(c)||S.crew.push(c));
 else if(k=="say")say(v);else if(k=="act")S.act=v;else if(k=="end")S.end=v;
 else S[k]+=v}
 S.food=Math.max(0,S.food);S.coin=Math.max(0,S.coin);S.intel=Math.max(0,S.intel);S.heat=Math.min(100,Math.max(0,S.heat))}
const f=n=>Math.ceil(n*(S.food>=1?1:.5)); // hunger halves progress
const pay=(k,n)=>S[k]>=n?(S[k]-=n,true):(say("not enough "+k+"."),false);

// ---------- ACTIVITIES: [id,label,cooldown s,min act,max act,fn] ----------
const A=[
["scav","scavenge the ridge",6,0,2,()=>{g({food:r(1,3),fame:f(1)});say(pick(["roots. a dead man’s heel of bread.","nothing but mud and flies.","a boot with a coin in it."]))}],
["snare","set snares",14,0,2,()=>{g({food:r(2,5),fame:f(1)});say("something small and warm for the pot.")}],
["beg","beg at the gate",8,1,3,()=>{g({coin:r(0,2),fame:f(1),rep:{Commoners:0.2}});say("a few thin coins. most walk past.")}],
["bread","buy bread",4,1,9,()=>{if(pay("coin",2)){g({food:2});say("bread. hard, but it’s bread.")}}],
["dock","haul at the docks",15,1,3,()=>{g({coin:r(3,5),fame:f(2),rep:{Commoners:0.3}});say("salt and rope-burn. coin for the day.")}],
["steal","cut purses",12,1,9,()=>{if(Math.random()<.6){g({coin:r(3,9),fame:f(3),heat:4});say("a purse comes free. nobody shouts.")}else{g({heat:9,food:-1,fame:f(1)});say("a hand on your wrist. you run, bleeding.")}}],
["listen","drink and listen",18,1,9,()=>{if(pay("coin",1)){if(Math.random()<.5){g({intel:1,fame:f(3)});say("a name, a route, a debt. you write it behind your eyes.")}else{g({fame:f(2)});say("only drunk boasting.")}}}],
["pit","fight in the pit",25,1,9,()=>{if(Math.random()<.65){g({coin:r(8,15),fame:f(6),rep:{Commoners:1}});say("the crowd roars your name wrong. you win.")}else{g({coin:-3,fame:f(2),heat:2});say("you eat sand and lose a tooth.")}}],
["low","lay low",30,1,9,()=>{if(pay("food",1)){g({heat:-15});say("a cellar, a blanket, no questions.")}}],
["fix","fix a match",40,2,9,()=>{if(pay("coin",10)){g({coin:r(25,40),fame:f(8),heat:3,rep:{Merchants:0.5}});say("the favorite takes a dive. the pit boss never meets your eye.")}}],
["cara","raid a caravan",45,2,9,()=>{g({coin:r(20,40),food:r(3,6),fame:f(12),heat:10,rep:{Merchants:-1}});say("wheels in the ditch, silk in the mud.")}],
["seal","forge a seal",50,2,9,()=>{if(pay("intel",2)){g({coin:r(30,50),fame:f(20),rep:{Nobility:-0.5}});say("wax and a borrowed crest. doors open.")}}],
["pull","pull the dead from the pit",20,3,9,()=>{g({fame:f(3)});say("the pit is yours now.")}].slice(0,0),
["drill","drill the warband",35,3,9,()=>{if(S.crew.length&&pay("food",2)){g({fame:f(12),rep:{Soldiers:1}});say("shields up. again. again.")}else if(!S.crew.length)say("no one to drill yet.")}],
["night","defend the fort at night",40,3,9,()=>{g({fame:f(15),food:r(0,2),heat:-3,rep:{Soldiers:0.5}});say("torches on the wall. the raiders learn better.")}],
["exec","work the execution crowd",45,3,9,()=>{g({fame:f(20),coin:r(10,25),rep:{Commoners:1.5},heat:8});say("a rope cut in the confusion. a name is whispered.")}],
["plague","plague-doctor rounds",45,4,9,()=>{g({fame:f(25),coin:r(20,40),rep:{Commoners:1,Clergy:0.5}});say("beak and wax coat. the sick pay in whatever they have.")}],
["relic","steal a relic",60,4,9,()=>{g({fame:f(30),coin:r(60,90),heat:12,rep:{Clergy:-1.5}});say("a saint’s finger changes hands.")}],
["tourn","sabotage the tournament",60,4,9,()=>{g({fame:f(30),coin:r(30,50),rep:{Nobility:-1}});say("a cut girth strap. a favorite unhorsed.")}],
["board","study the investigation board",50,4,9,()=>{if(pay("intel",2)){g({fame:f(40)});say("string, ink, stolen letters. the pattern shows itself.")}}]
].filter(a=>a[0]!="pull");
// ---------- BASE ----------
const B=[["rubble","clear the rubble",30,"room for more men."],["forge","set the forge",50,"iron for the warband."],["watch","post lookouts",70,"patrols lose your trail."],["pit","dig a fighting pit",90,"coin from the crowds."],["shrine","raise a shrine",110,"the clergy take notice."]];
// ---------- QUESTS: [name,fame needed,intel needed,text,[[choice,effect]]] ----------
const Q=[
["The Ridge",0,0,"“Drop the dead weight, boy. Duke’s orders.” Sergeant Roric stands over Edric, who is still breathing.",[
 ["kill Roric, hold Edric till the end",{fl:{roric:"dead",edric:"comfort"},rep:{Soldiers:-1,Commoners:1},act:1,say:"Roric falls. You are branded and hunted. Greyhaven’s walls rise through the rain."}],
 ["kill Roric, end Edric’s pain quickly",{fl:{roric:"dead",edric:"mercy"},rep:{Soldiers:-1},act:1,say:"Two deaths. The brand on your neck is a broken sword. Greyhaven ahead."}],
 ["obey. leave Edric.",{fl:{roric:"alive",edric:"left"},rep:{Soldiers:1},act:1,say:"You walk. His eyes follow you. Greyhaven ahead."}]]],
["Rook’s First Blood",25,0,"Rook, one ear, eyes like wet stone: “Deserter. I can smell it. You want to eat tomorrow or hang?”",[
 ["knife a debt-bodyguard in the alley",{coin:15,fame:8,fl:{rook:"ally"},say:"A clean job. Rook pays and smiles."}],
 ["club him from behind, take his purse too",{coin:25,heat:8,fl:{rook:"ally"},say:"Rook laughs. You’ll go far or die soon."}],
 ["kill Rook instead",{coin:30,heat:15,fame:12,fl:{rook:"dead"},say:"Rook dies surprised. You are a name now."}]]],
["The Harbor Master",90,0,"A festival, a crowd, a man who will not see tomorrow. Lira: “How you do it is your business.”",[
 ["crane and crossbow",{fame:30,coin:30,heat:5,fl:{lira:"met"},say:"A bolt from the crane. The harbor master falls into the festival."}],
 ["dancer’s disguise",{fame:25,coin:35,rep:{Nobility:1},fl:{lira:"met"},say:"A waltz, a blade, a bow."}],
 ["poison the wine",{fame:25,coin:30,rep:{Merchants:-0.5},fl:{lira:"met"},say:"He toasts himself. Lira watches you from a doorway."}],
 ["pure chaos",{fame:35,coin:20,heat:20,rep:{Commoners:-1},fl:{lira:"met"},say:"Torches, panic, a body in the water. Lira: “Loud.”"}]]],
["Blood on the Ledger",200,0,"Three contracts: a market tax collector, a bathhouse broker, a Church informant.",[
 ["kill all three, quietly",{coin:60,fame:30,rep:{Clergy:-1},say:"Three ledgers, three funerals."}],
 ["spare the informant",{coin:35,fame:25,rep:{Clergy:1,Commoners:0.5},say:"The priest’s man lives. He remembers it."}],
 ["spare the tax collector’s family, take the ledgers",{coin:40,intel:2,rep:{Commoners:2},say:"Mercy and paper. Both useful."}]]],
["The Baron’s Letters",400,3,"Baron Veylan holds letters that can break half the nobility. Torven, a disgraced knight, waits at the gate.",[
 ["kill him cleanly, burn the letters",{fl:{baron:"dead"},fame:50,heat:10,crew:["Torven"],act:2,say:"A quiet death. A power vacuum opens in the south."}],
 ["read the letters first",{fl:{baron:"read"},intel:4,fame:50,crew:["Torven"],act:2,say:"Names. Debts. Secrets. You know too much now."}],
 ["blackmail him",{fl:{baron:"leashed"},coin:80,fame:50,crew:["Torven"],act:2,say:"The Baron lives, and pays. For now."}],
 ["frame a rival",{fl:{baron:"framed"},fame:60,rep:{Nobility:-1},crew:["Torven"],act:2,say:"The rival hangs. Veylan’s house survives."}],
 ["sell the letters",{fl:{baron:"sold"},coin:200,fame:40,rep:{Merchants:1},crew:["Torven"],act:2,say:"Gold now. Chaos later."}]]],
["Caravan on the Salt Road",650,0,"A fat caravan, thin guards. Scout, sabotage, ambush. Then decide who lives.",[
 ["spare the drivers",{coin:60,rep:{Commoners:1.5,Merchants:-0.5},fame:40,say:"Wheels broken. Men walk away."}],
 ["leave none",{coin:100,heat:15,rep:{Commoners:-2,Merchants:-2},fame:40,say:"Crows by morning."}],
 ["ransom the merchants",{coin:140,rep:{Merchants:-1},fame:40,say:"Their guilds pay quickly."}]]],
["A Test for the Chain",900,0,"The Veiled Chain asks you to kill a clerk. Lira says nothing. That is the answer.",[
 ["do it",{fl:{chain:"obedient"},fame:50,rep:{Nobility:0.5},crew:["Lira"],say:"The Chain approves. You feel it settle."}],
 ["refuse",{fl:{chain:"defiant"},heat:10,fame:40,crew:["Lira"],say:"Lira stays, but wary of what you are."}],
 ["do it, hide the clerk’s family",{fl:{chain:"mixed"},fame:50,rep:{Commoners:1},crew:["Lira"],say:"A death and a rescue. The Chain notes both."}]]],
["A Smaller Vacuum",1200,0,"You test your influence: topple a minor lord, and see what rushes in.",[
 ["burn his granary",{fame:60,rep:{Commoners:-1},act:3,say:"Hunger topples him. The ruined fort of Black Hollow is empty."}],
 ["poison his cup",{fame:60,rep:{Nobility:-0.5},act:3,say:"A quiet funeral. Black Hollow is yours for the taking."}],
 ["buy his guards",{coin:-100,fame:70,rep:{Soldiers:1.5},act:3,say:"Coin walks the walls. Black Hollow waits."}]]],
["Black Hollow",1500,0,"A ruined fort full of deserters. Your first real base.",[
 ["drive out the deserters",{fame:60,rep:{Soldiers:-1},say:"Cleared. Quiet and cold."}],
 ["take them in as garrison",{fame:60,crew:["Dunn"],rep:{Soldiers:1.5},say:"Deserters make good wall-men."}]]],
["The Prison Wagon",1900,0,"An escort of six, a wagon of chained men. A raid and a choice.",[
 ["free everyone",{crew:["Mara","Pell"],rep:{Commoners:2,Nobility:-1},fame:70,say:"Chains fall. Loyalty rises."}],
 ["free only the fighters",{crew:["Mara"],fame:70,say:"The rest rattle on, begging."}],
 ["take the guard-captain’s purse and leave",{coin:150,fame:50,say:"Business is business."}]]],
["The Disgraced Knight",2300,0,"Ser Aldric lives in a barn, bitter and brave. His former lord holds his honor.",[
 ["win a judicial duel for his name",{crew:["Ser Aldric"],rep:{Nobility:1.5,Soldiers:1},fame:80,say:"Steel decides. Aldric kneels."}],
 ["blackmail the lord",{crew:["Ser Aldric"],rep:{Nobility:-1},coin:100,fame:80,say:"Honor, cashed in."}]]],
["Marsh End",2700,0,"A village at the edge of your territory. Raiders are coming for it.",[
 ["protect it",{rep:{Commoners:3},fame:80,fl:{village:"protected"},say:"Marsh End will send recruits."}],
 ["tax them for protection",{coin:120,rep:{Commoners:-1.5},fame:80,fl:{village:"taxed"},say:"They pay. They watch."}]]],
["Ghost of the Ridge",3200,0,"The officer who left the wounded to die, and ordered Roric. You have him.",[
 ["slow kill",{fl:{officer:"slow"},fame:90,rep:{Commoners:-1},act:4,say:"It takes a long night. You do not feel better."}],
 ["clean kill",{fl:{officer:"clean"},fame:90,act:4,say:"One cut. Done."}],
 ["recruit him",{fl:{officer:"recruit"},fame:90,crew:["The Officer"],rep:{Soldiers:1},act:4,say:"A broken man swears. Torven stares."}],
 ["mutilate him and send him home",{fl:{officer:"mutilated"},fame:90,rep:{Soldiers:-1.5},act:4,say:"Let them see what you are."}],
 ["walk away",{fl:{officer:"spared"},fame:80,rep:{Commoners:1},act:4,say:"The ridge stays behind you."}]]],
["The Duke’s Shadow: The Summit",3800,0,"Duke Harren hosts the largest gathering in the realm. How do you get in?",[
 ["plague doctor",{fl:{disguise:"plague"},fame:80,say:"Nobody stops the beak."}],
 ["servant",{fl:{disguise:"servant"},fame:80,say:"Invisible in plain sight."}],
 ["soldier",{fl:{disguise:"soldier"},fame:80,say:"A salute, a spear, a gate."}],
 ["minor noble",{fl:{disguise:"noble"},fame:80,coin:-60,say:"Silk, a forged seal, a stolen name."}]]],
["The Duke’s Shadow: Three Whispers",4300,3,"A pickpocket at the feast, a rooftop eavesdrop, a courier you can take.",[
 ["pickpocket the steward",{fame:90,intel:1,say:"His seal is in your sleeve."}],
 ["listen from the rooftops",{fame:90,intel:1,rep:{Commoners:0.5},say:"A schedule, spoken carelessly."}],
 ["take the courier alive",{fame:90,intel:1,heat:8,say:"He talks. You wish he hadn’t."}]]],
["The Duke’s Shadow: The Duke Falls",4900,0,"The signature kill. Choose the method, or spare him.",[
 ["collapse the bridge",{fl:{duke:"bridge"},fame:150,rep:{Soldiers:-1,Commoners:-0.5},heat:20,say:"Stone and screams. The succession war heaves."}],
 ["poison him at the cathedral",{fl:{duke:"poison"},fame:150,rep:{Clergy:-2},say:"He dies mid-prayer."}],
 ["public warband strike",{fl:{duke:"public"},fame:150,rep:{Commoners:1,Nobility:-2},heat:25,say:"Banners in daylight. Your name is on every tongue."}],
 ["staged hunting accident",{fl:{duke:"accident"},fame:150,say:"A tragedy. No one proves otherwise."}],
 ["spare him",{fl:{duke:"spared"},fame:100,rep:{Nobility:2},say:"He owes you his life. He will resent it."}]]],
["The Chain Moves",5400,0,"The Veiled Chain steps into the light. Partnership, control, or war.",[
 ["join the Chain",{fl:{chain:"joined"},fame:100,rep:{Nobility:1},say:"A seat in the dark."}],
 ["use the Chain",{fl:{chain:"used"},fame:100,say:"Each knife has a hilt. Yours."}],
 ["destroy the Chain",{fl:{chain:"destroyed"},fame:150,heat:30,say:"Open war with the Chain."}]]],
["Lira and Torven",6000,0,"Both have changed. Both have limits. Both are watching.",[
 ["trust them both",{fl:{lira:"loyal",torven:"loyal"},fame:100,act:5,say:"Two chairs stay filled."}],
 ["silence Lira",{fl:{lira:"dead",torven:"loyal"},fame:100,act:5,say:"Lira’s eyes are no longer tired."}],
 ["send Torven away",{fl:{lira:"loyal",torven:"gone"},fame:100,act:5,say:"Torven leaves without a word."}],
 ["bind both to an oath",{fl:{lira:"bound",torven:"bound"},fame:100,act:5,say:"Oaths hold until they don’t."}]]],
["Crown of Ash",6800,0,"The last choice. What do you make of a broken kingdom?",[
 ["open crown",{end:"iron"}],["shadow rule",{end:"shadow"}],["break the Chain",{end:"broken"}],["stabilization",{end:"stab"}],["scorched earth",{end:"ash"}]]]
];
// ---------- ENDINGS ----------
function epilogue(){const R=S.rep,top=Object.keys(R).sort((a,b)=>R[b]-R[a])[0],low=Object.keys(R).sort((a,b)=>R[a]-R[b])[0];
 const E={iron:["Iron Crown","You take the crown openly. The war ends under a hard hand."],shadow:["Shadow Throne","No crown, no face. Puppets speak, and the realm obeys."],broken:["The Chain Broken","The Chain’s leadership is gone. What fills the gap is not yet known."],stab:["Reluctant Crown","You build something less brutal. It is the hardest road, and still grey."],ash:["Ashes","You burn what you cannot hold. Legend takes what is left of you."]}[S.end];
 const L={loyal:"Lira stands at your side.",bound:"Lira serves, bound by oath.",dead:"Lira’s chair is empty."}[S.fl.lira]||"Lira is a rumor.";
 const T={loyal:"Torven commands your soldiers.",bound:"Torven is bound to your oath.",gone:"Torven rides a long road away."}[S.fl.torven]||"Torven is a memory.";
 const pol=R[top]>R[low]+3?` The ${top.toLowerCase()} remember you kindly; the ${low.toLowerCase()} do not.`:"";
 const ed={comfort:"Edric died in your arms.",mercy:"Edric’s pain ended at your hand.",left:"You never stopped hearing Edric."}[S.fl.edric]||"";
 return `<h3>${E[0]}</h3><p>${E[1]}</p><p>${L} ${T}${pol}</p><p>${ed} ${S.fl.duke=="spared"?"The Duke lives, watching you.":"The Duke’s fall shaped everything after."}</p><div class="btn" data-c="restart"><span>begin again</span></div>`}

// ---------- RENDER ----------
const met=q=>S.fame>=q[1]/PACE&&S.intel>=q[2];
const btn=(id,label,attr)=>`<div class="btn" ${attr}="${id}"><div class="bar"></div><span>${label}</span></div>`;
function render(){
 const tabs=["journal","quests"].concat(S.act>=3?["hollow"]:[],["standing"]);
 $("#tabs").innerHTML=tabs.map(t=>`<span class="tab ${S.tab==t?"on":""}" data-t="${t}">${t}</span>`).join("");
 $("#log").innerHTML=S.log.map((l,i)=>`<div style="opacity:${Math.max(.15,1-i*.12)}">${l}</div>`).join("");
 const row=(k,v)=>`<div class="row"><span>${k}</span><span>${v}</span></div>`;
 $("#stats").innerHTML=`<div class="box"><h4>${ACTS[S.act]}</h4>${row("food",Math.floor(S.food))}${row("coin",Math.floor(S.coin))}${S.act>=1?row("intel",Math.floor(S.intel)):""}${S.act>=1?row("heat",Math.floor(S.heat)):""}</div>${S.crew.length?`<div class="box"><h4>warband</h4>${S.crew.map(c=>`<div>${c}</div>`).join("")}</div>`:""}`;
 let h="";
 if(S.end)h=epilogue();
 else if(S.tab=="journal")h=A.filter(a=>S.act>=a[3]&&S.act<=a[4]).map(a=>btn(a[0],a[1],"data-a")).join("");
 else if(S.tab=="quests"){const q=Q[S.qi];
  if(open)h=`<h3>${q[0]}</h3><p>${q[3]}</p>`+q[4].map((c,i)=>`<div class="btn" data-q="${i}"><span>${c[0]}</span></div>`).join("");
  else h=`<h3>${q[0]}</h3><p class="small">${q[3]}</p><p class="small">needs ${Math.ceil(q[1]/PACE)} renown${q[2]?` and ${q[2]} intel`:""}. you have ${Math.floor(S.fame)} renown.</p><div class="btn ${met(q)?"":"dis"}" data-c="open"><span>${met(q)?"take the job":"not yet"}</span></div>`}
 else if(S.tab=="hollow")h=B.map(b=>S.built[b[0]]?`<div class="q small">${b[1]}: built. ${b[3]}</div>`:btn(b[0],`${b[1]} (${b[2]}c)`,"data-b")).join("");
 else h=`<div class="box"><h4>reputation</h4>${Object.keys(S.rep).map(k=>row(k,S.rep[k].toFixed(1))).join("")}</div><div class="small">renown ${Math.floor(S.fame)}</div>`;
 $("#main").innerHTML=h;ui()}
function ui(){const now=Date.now();document.querySelectorAll(".btn[data-a]").forEach(b=>{const a=A.find(x=>x[0]==b.dataset.a),end=S.cd[a[0]]||0,rem=end-now,on=rem>0;b.classList.toggle("dis",on);b.firstChild.style.width=on?(rem/(a[2]*1000)*100)+"%":"0"})}
document.addEventListener("click",e=>{const el=e.target.closest("[data-a],[data-t],[data-q],[data-b],[data-c]");if(!el)return;const d=el.dataset;
 if(d.t){S.tab=d.t;open=false}
 else if(d.a){const a=A.find(x=>x[0]==d.a);if((S.cd[a[0]]||0)>Date.now())return;S.cd[a[0]]=Date.now()+a[2]*1000;a[5]()}
 else if(d.b){const b=B.find(x=>x[0]==d.b);if(pay("coin",b[2])){S.built[b[0]]=1;say(b[3])}}
 else if(d.q!==undefined){g(Q[S.qi][4][d.q][1]);open=false;if(!S.end){S.qi=Math.min(S.qi+1,Q.length-1);S.tab="journal"}}
 else if(d.c=="open"){if(met(Q[S.qi]))open=true}
 else if(d.c=="restart"){S=fresh();open=false}
 save();render()});
$("#reset").onclick=()=>{if(confirm("Erase your save and start over?")){S=fresh();open=false;save();render()}};
// ---------- WORLD TICK (every 10s) ----------
setInterval(()=>{if(S.end)return;const c=S.crew.length;
 S.food=Math.max(0,S.food-.1*(1+c*.5));
 S.coin+=c*.2+(S.built.forge?.3:0)+(S.built.pit?.5:0);
 S.heat=Math.max(0,S.heat-(S.built.watch?.8:.3));
 if(S.built.shrine)S.rep.Clergy+=.01;
 if(S.food<1&&Math.random()<.3)say("your stomach is a fist.");
 if(S.heat>25&&Math.random()<.25){const l=Math.min(S.coin,r(3,15));S.coin-=l;S.heat-=8;say("a patrol shakes you down. "+Math.floor(l)+" coin gone.")}
 save();render()},10000);
setInterval(ui,250);render();

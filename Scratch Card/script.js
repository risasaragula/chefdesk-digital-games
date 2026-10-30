
const rewards=[{name:"FREE COFFEE",icon:"☕"},{name:"10% OFF",icon:"🏷️"},{name:"FREE DESSERT",icon:"🍰"},{name:"BONUS POINTS",icon:"🪙"},{name:"FREE UPGRADE",icon:"👑"},{name:"TRY AGAIN",icon:"🍀"}];
const STORAGE_KEY="chefdesk_scratch_used_bills_v2",WIN_PROBABILITY=.20;
const canvas=document.getElementById("scratchCanvas"),ctx=canvas.getContext("2d",{willReadFrequently:true}),frame=document.querySelector(".scratch-frame"),prizeIcon=document.getElementById("prizeIcon"),prizeName=document.getElementById("prizeName"),prizeDescription=document.getElementById("prizeDescription"),progressFill=document.getElementById("progressFill"),progressPercent=document.getElementById("progressPercent"),progressText=document.getElementById("progressText"),revealBtn=document.getElementById("revealBtn"),finishedActions=document.getElementById("finishedActions"),winMessage=document.getElementById("winMessage"),playAgainBtn=document.getElementById("playAgainBtn");
let visitCode="",scratching=false,completed=false,lastPoint=null,scratches=0,currentReward=null,unlocked=false;
function usedVisits(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
function reserveVisit(code){const visits=usedVisits();if(visits.includes(code))return false;try{localStorage.setItem(STORAGE_KEY,JSON.stringify([...visits,code]));return true}catch{return false}}
function createGate(){
const gate=document.createElement("section");
gate.id="visitGate";
gate.innerHTML='<div class="visit-gate-card"><div style="font-size:36px">🎟️</div><h2>Unlock your scratch card</h2><p>Enter the visit code from your restaurant bill to play. Login is required only if you win and want to claim your reward.</p><form id="visitForm"><label for="billCode">Visit code</label><input id="billCode" required maxlength="40" placeholder="Example: BILL1001" autocomplete="off"><button type="submit">Unlock My Card →</button></form><p id="visitError" role="alert"></p><p>One scratch card per bill code in this demo.</p></div>';
const style=document.createElement("style");
style.textContent='.visit-gate-card{max-width:470px;margin:24px auto;padding:27px 24px;background:#fffdf8;border:1px solid #e9d9c8;border-radius:24px;text-align:center;box-shadow:0 12px 34px #8c5b3029;color:#30281e}.visit-gate-card h2{font-size:26px;margin:12px 0}.visit-gate-card p{margin:12px 0;color:#70645b;font-size:14px;line-height:1.5}.visit-gate-card form{display:grid;gap:9px;text-align:left;margin-top:18px}.visit-gate-card label{font-weight:700;font-size:13px}.visit-gate-card input{min-height:47px;padding:12px;border:1px solid #dcc8af;border-radius:10px;font:inherit}.visit-gate-card button{min-height:46px;border:0;border-radius:10px;background:#e94c13;color:#fff;font:inherit;font-weight:800;cursor:pointer}.visit-gate-card #visitError{color:#bc3023;font-weight:700}#visitGate[hidden],.scratch-card[hidden]{display:none!important}@media(max-width:600px){.visit-gate-card{padding:20px 15px;margin:15px auto}}';
document.head.appendChild(style);
document.querySelector(".scratch-card").before(gate);
document.querySelector(".scratch-card").hidden=true;
document.getElementById("visitForm").addEventListener("submit",e=>{
e.preventDefault();
const code=document.getElementById("billCode").value.trim().toUpperCase(),error=document.getElementById("visitError");
error.textContent="";
if(code.length<4){error.textContent="Enter a valid visit code (at least 4 characters).";return}
if(usedVisits().includes(code)){error.textContent="This bill was already used for Scratch & Win. Use a new bill next visit.";return}
if(!reserveVisit(code)){error.textContent="Unable to save this attempt. Please try again.";return}
visitCode=code;
unlocked=true;
gate.hidden=true;
document.querySelector(".scratch-card").hidden=false;
document.querySelector(".gift-icon").hidden=false;
const v=document.querySelector(".instructions");
if(v)v.hidden=false;
const h=document.querySelector(".scratch-card h2");
if(h)h.hidden=false;
document.querySelector(".progress-row").hidden=false;
progressText.hidden=false;
revealBtn.hidden=false;
resetCard();
});
}
function setProgress(value){
const p=Math.min(100,Math.max(0,Math.round(value)));
progressFill.style.width=p+"%";
progressPercent.textContent=p+"%";
progressText.textContent="Scratched: "+p+"%";
}
function prepareReward(){
currentReward=Math.random()<WIN_PROBABILITY?rewards[Math.floor(Math.random()*5)]:rewards[5];
prizeIcon.textContent=currentReward.icon;
prizeName.textContent=currentReward.name;
prizeDescription.textContent=currentReward.name==="TRY AGAIN"?"Better luck next visit!":"A delicious surprise for you!";
}
function drawSilver(){
const w=canvas.width,h=canvas.height;
ctx.globalCompositeOperation="source-over";
ctx.clearRect(0,0,w,h);
const gradient=ctx.createLinearGradient(0,0,w,h);
gradient.addColorStop(0,"#9ea2a5");
gradient.addColorStop(.2,"#e4e5e6");
gradient.addColorStop(.48,"#b0b4b7");
gradient.addColorStop(.7,"#f1f2f2");
gradient.addColorStop(1,"#90969b");
ctx.fillStyle=gradient;
ctx.fillRect(0,0,w,h);
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.fillStyle="#676d72";
ctx.font=`800 ${Math.max(16,w*.052)}px Arial`;
ctx.fillText("SCRATCH HERE ✨",w/2,h/2);
}
function setupCanvas(){
const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=Math.max(1,Math.round(rect.width*dpr));
canvas.height=Math.max(1,Math.round(rect.height*dpr));
drawSilver();
}
function getPoint(e){
const r=canvas.getBoundingClientRect();
return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};
}
function erase(a,b){
const brush=Math.max(24,canvas.width*.09);
ctx.globalCompositeOperation="destination-out";
ctx.lineWidth=brush;
ctx.lineCap="round";
ctx.lineJoin="round";
ctx.beginPath();
ctx.moveTo(a.x,a.y);
ctx.lineTo(b.x,b.y);
ctx.stroke();
ctx.beginPath();
ctx.arc(b.x,b.y,brush/2,0,2*Math.PI);
ctx.fill();
ctx.globalCompositeOperation="source-over";
}
function scratchedPercent(){
const w=canvas.width,h=canvas.height,p=ctx.getImageData(0,0,w,h).data;
let clear=0,total=0;
for(let y=0;y<h;y+=12){
for(let x=0;x<w;x+=12){
if(p[(y*w+x)*4+3]<128)clear++;
total++;
}
}
return total?clear/total*100:0;
}
function finish(){
if(completed||!unlocked)return;
completed=true;
scratching=false;
canvas.style.transition="opacity .5s ease";
canvas.style.opacity="0";
canvas.style.pointerEvents="none";
setProgress(100);
revealBtn.hidden=true;
finishedActions.hidden=false;
const won=currentReward.name!=="TRY AGAIN";
winMessage.textContent=won?"You found: "+currentReward.name+"!":"Better luck next visit!";
if(won){
winMessage.textContent="You won! Sign in to claim your demo reward.";
ChefDeskPrizeClaim.offerClaim("Scratch & Win",currentReward.name,visitCode,winMessage,finishedActions);
}
playAgainBtn.textContent="Back to Dashboard";
playAgainBtn.onclick=()=>{location.href="../Dashboard/index.html"};
}
function startScratch(e){
if(completed||!unlocked||e.button!==undefined&&e.button!==0)return;
scratching=true;
lastPoint=getPoint(e);
scratches++;
canvas.setPointerCapture(e.pointerId);
erase(lastPoint,lastPoint);
e.preventDefault();
}
function moveScratch(e){
if(!scratching||completed)return;
const point=getPoint(e);
erase(lastPoint,point);
lastPoint=point;
scratches++;
if(scratches%5===0){
const percent=scratchedPercent();
setProgress(percent);
if(percent>=40)finish();
}
e.preventDefault();
}
function stopScratch(){
if(!scratching)return;
scratching=false;
lastPoint=null;
if(!completed){
const percent=scratchedPercent();
setProgress(percent);
if(percent>=40)finish();
}
}
function resetCard(){
completed=false;
scratching=false;
scratches=0;
lastPoint=null;
canvas.style.transition="none";
canvas.style.opacity="1";
canvas.style.pointerEvents="auto";
revealBtn.hidden=false;
finishedActions.hidden=true;
setProgress(0);
prepareReward();
requestAnimationFrame(setupCanvas);
}
canvas.addEventListener("pointerdown",startScratch);
canvas.addEventListener("pointermove",moveScratch);
canvas.addEventListener("pointerup",stopScratch);
canvas.addEventListener("pointercancel",stopScratch);
canvas.addEventListener("lostpointercapture",stopScratch);
revealBtn.addEventListener("click",finish);
let resizeTimer;
window.addEventListener("resize",()=>{
clearTimeout(resizeTimer);
resizeTimer=setTimeout(()=>{
if(unlocked&&!completed){
scratching=false;
lastPoint=null;
setProgress(0);
setupCanvas();
}
},200);
});
createGate();
ChefDeskPrizeClaim.restorePendingClaim();

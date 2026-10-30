
const rewards=[{name:"Free Coffee",label:["FREE","COFFEE"],icon:"☕",color:"#ffcc48"},{name:"10% Off",label:["10%","OFF"],icon:"🏷️",color:"#ff9eb2"},{name:"Free Dessert",label:["FREE","DESSERT"],icon:"🍰",color:"#91e6bb"},{name:"Try Again",label:["TRY","AGAIN"],icon:"🔄",color:"#ffab80"},{name:"Bonus Points",label:["BONUS","POINTS"],icon:"🪙",color:"#d6a2fa"},{name:"Free Upgrade",label:["FREE","UPGRADE"],icon:"👑",color:"#83cfff"}];
const canvas=document.getElementById("wheelCanvas"),ctx=canvas.getContext("2d"),rotator=document.getElementById("wheelRotator"),spinBtn=document.getElementById("spinBtn"),statusText=document.getElementById("status"),overlay=document.getElementById("resultOverlay"),resultIcon=document.getElementById("resultIcon"),resultTitle=document.getElementById("resultTitle"),resultMessage=document.getElementById("resultMessage"),rewardsList=document.getElementById("rewardsList"),closeResult=document.getElementById("closeResult");
const STORAGE_KEY="chefdesk_spin_used_bills_v2",WIN_PROBABILITY=.20;
let visitCode="",rotation=0,spinning=false,used=false,selectedReward=null;
function usedVisits(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
function reserveVisit(code){const visits=usedVisits();if(visits.includes(code))return false;try{localStorage.setItem(STORAGE_KEY,JSON.stringify([...visits,code]));return true}catch{return false}}
function createGate(){
const gate=document.createElement("section");
gate.id="visitGate";
gate.innerHTML='<div class="visit-gate-card"><div style="font-size:36px">🎟️</div><h2>Unlock your spin!</h2><p>Enter the visit code from your restaurant bill to play. Login is required only if you win and want to claim your reward.</p><form id="visitForm"><label for="billCode">Visit code</label><input id="billCode" required maxlength="40" placeholder="Example: BILL1001" autocomplete="off"><button type="submit">Unlock My Spin →</button></form><p id="visitError" role="alert"></p><p>One spin per bill code in this demo.</p></div>';
const style=document.createElement("style");
style.textContent='.visit-gate-card{max-width:470px;margin:24px auto;padding:27px 24px;background:#fffdf8;border:1px solid #e9d9c8;border-radius:24px;text-align:center;box-shadow:0 12px 34px #8c5b3029;color:#30281e}.visit-gate-card h2{font-size:27px;margin:12px 0}.visit-gate-card p{margin:12px 0;color:#70645b;font-size:14px;line-height:1.5}.visit-gate-card form{display:grid;gap:9px;text-align:left;margin-top:18px}.visit-gate-card label{font-weight:700;font-size:13px}.visit-gate-card input{min-height:47px;padding:12px;border:1px solid #dcc8af;border-radius:10px;font:inherit}.visit-gate-card button{min-height:46px;border:0;border-radius:10px;background:#e94c13;color:white;font:inherit;font-weight:800;cursor:pointer}.visit-gate-card #visitError{color:#bc3023;font-weight:700}.wheel-section[hidden],.rewards-panel[hidden],#visitGate[hidden]{display:none!important}@media(max-width:600px){.visit-gate-card{padding:20px 15px;margin:15px auto}}';
document.head.appendChild(style);
document.querySelector(".game-layout").before(gate);
document.querySelector(".wheel-section").hidden=true;
document.querySelector(".rewards-panel").hidden=true;
document.getElementById("visitForm").addEventListener("submit",e=>{
e.preventDefault();
const code=document.getElementById("billCode").value.trim().toUpperCase(),error=document.getElementById("visitError");
error.textContent="";
if(code.length<4){error.textContent="Enter a valid visit code (at least 4 characters).";return}
if(usedVisits().includes(code)){error.textContent="This bill has already been used for Spin & Win. Use a new bill code next visit.";return}
visitCode=code;
gate.hidden=true;
document.querySelector(".wheel-section").hidden=false;
document.querySelector(".rewards-panel").hidden=false;
statusText.textContent="One spin per bill. Good luck!";
});
}
function drawWheel(){
const s=700,c=350,r=340,a=2*Math.PI/rewards.length;
ctx.clearRect(0,0,s,s);
rewards.forEach((v,i)=>{
const start=-Math.PI/2-a/2+i*a,m=start+a/2;
ctx.beginPath();
ctx.moveTo(c,c);
ctx.arc(c,c,r,start,start+a);
ctx.closePath();
ctx.fillStyle=v.color;
ctx.fill();
ctx.strokeStyle="#fff6d6";
ctx.lineWidth=4;
ctx.stroke();
ctx.save();
ctx.translate(c+Math.cos(m)*r*.65,c+Math.sin(m)*r*.65);
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.font='48px "Segoe UI Emoji",sans-serif';
ctx.fillText(v.icon,0,-34);
ctx.fillStyle="#171717";
ctx.font="800 22px Arial";
v.label.forEach((line,j)=>ctx.fillText(line,0,23+j*26));
ctx.restore();
});
for(let i=0;i<48;i++){
let a=i*2*Math.PI/48;
ctx.beginPath();
ctx.arc(c+Math.cos(a)*326,c+Math.sin(a)*326,i%2===0?5:3,0,Math.PI*2);
ctx.fillStyle=i%2===0?"#fff6bb":"#f0a72c";
ctx.fill();
}
ctx.beginPath();
ctx.arc(c,c,89,0,2*Math.PI);
ctx.fillStyle="#ffdf83";
ctx.fill();
ctx.beginPath();
ctx.arc(c,c,81,0,2*Math.PI);
ctx.fillStyle="#e95618";
ctx.fill();
}
function renderRewards(){
rewardsList.innerHTML="";
for(const reward of rewards){
const item=document.createElement("div");
item.className="reward-item";
item.innerHTML='<span class="reward-icon"></span><span class="reward-name"></span>';
item.children[0].textContent=reward.icon;
item.children[1].textContent=reward.name;
rewardsList.appendChild(item);
}
}
function chooseReward(){
if(Math.random()>=WIN_PROBABILITY)return 3;
const indices=[0,1,2,4,5];
return indices[Math.floor(Math.random()*indices.length)];
}
function spinWheel(){
if(spinning||used||!visitCode)return;
if(!reserveVisit(visitCode)){
statusText.textContent="This bill was already used, or the attempt could not be saved.";
spinBtn.disabled=true;
return;
}
used=true;
spinning=true;
spinBtn.disabled=true;
spinBtn.textContent="...";
statusText.textContent="Spinning... good luck!";
selectedReward=chooseReward();
const target=(360-selectedReward*60)%360,current=((rotation%360)+360)%360,extra=(target-current+360)%360;
rotation+=2160+extra;
requestAnimationFrame(()=>{rotator.style.transform=`rotate(${rotation}deg)`});
}
function finishSpin(){
if(!spinning||selectedReward===null)return;
spinning=false;
const reward=rewards[selectedReward];
resultIcon.textContent=reward.icon;
resultTitle.textContent=reward.name;
resultMessage.textContent=selectedReward===3?"No reward this time. Come back for another restaurant visit.":"You won! Sign in to claim your demo reward.";
if(selectedReward!==3){
ChefDeskPrizeClaim.offerClaim("Spin & Win",reward.name.toUpperCase(),visitCode,resultMessage,document.querySelector("#resultOverlay .result-card"));
}
statusText.textContent="Spin used for bill "+visitCode;
spinBtn.textContent="USED";
overlay.hidden=false;
closeResult.focus();
selectedReward=null;
}
spinBtn.addEventListener("click",spinWheel);
rotator.addEventListener("transitionend",e=>{if(e.propertyName==="transform")finishSpin()});
closeResult.addEventListener("click",()=>{overlay.hidden=true});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)overlay.hidden=true});
drawWheel();
renderRewards();
createGate();
ChefDeskPrizeClaim.restorePendingClaim();

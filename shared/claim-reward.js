
(function(){
const KEY="chefdesk_pending_prizes_v1";
function load(){
try{
const v=JSON.parse(localStorage.getItem(KEY)||"[]");
return Array.isArray(v)?v:[];
}catch{return[]}
}
function save(items){
localStorage.setItem(KEY,JSON.stringify(items));
}
function offerClaim(game,prize,bill,message,container){
const key=game+":"+bill;
const all=load();
if(!all.some(item=>item.key===key)){
all.push({key,game,prize,bill});
save(all);
}
renderClaim(key,message,container);
}
function renderClaim(key,message,container){
if(!container||container.querySelector('[data-chefdesk-claim="'+key+'"]'))return;
const button=document.createElement("button");
button.type="button";
button.dataset.chefdeskClaim=key;
button.textContent="Sign In & Claim Reward";
button.style.cssText="display:block;max-width:100%;min-height:44px;margin:12px auto;padding:10px 18px;border:0;border-radius:12px;background:#e94c13;color:white;font:700 15px Arial;cursor:pointer";
button.addEventListener("click",async()=>{
button.disabled=true;
button.textContent="Opening login...";
try{
const item=load().find(value=>value.key===key);
if(!item){
button.remove();
return;
}
if(!window.ChefDesk?.requireLogin||!window.ChefDesk?.addDemoReward){
throw Error("Login or rewards unavailable");
}
await ChefDesk.requireLogin();
ChefDesk.addDemoReward(item.game,item.prize,item.bill);
save(load().filter(value=>value.key!==key));
message.textContent="Reward saved! Open My Rewards to view it.";
button.textContent="Reward Claimed";
button.disabled=true;
}catch(error){
console.error("Reward claim:",error);
message.textContent="Reward not yet claimed. Sign in and try again.";
button.textContent="Try Claim Again";
button.disabled=false;
}
});
container.appendChild(button);
}
function restorePendingClaim(){
const game=location.pathname.toLowerCase().includes("spinthewheel")?"Spin & Win":"Scratch & Win";
const items=load().filter(item=>item.game===game);
if(!items.length)return;
const box=document.createElement("section");
box.style.cssText="max-width:460px;margin:16px auto;padding:14px;text-align:center;background:#fff7ef;border:1px solid #efd1b4;border-radius:14px;color:#35261b";
const heading=document.createElement("p");
heading.textContent="You have an unclaimed demo reward from your previous visit.";
box.appendChild(heading);
const parent=document.querySelector(".game-heading")||document.querySelector(".game-page");
if(parent)parent.after(box);
items.forEach(item=>renderClaim(item.key,heading,box));
}
window.ChefDeskPrizeClaim={offerClaim,restorePendingClaim};
})();

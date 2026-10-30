
const board=document.getElementById("board");
const timerEl=document.getElementById("timer");
const mistakesEl=document.getElementById("mistakes");
const hintsEl=document.getElementById("hints");
const message=document.getElementById("message");
let solution=[],puzzle=[],entries=[],selected=-1,mistakes=0,hints=3,seconds=0,finished=false,clock=null;
function shuffle(array){
for(let i=array.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[array[i],array[j]]=[array[j],array[i]];
}
return array;
}
function generateSolution(){
const groups=shuffle([0,1,2]);
const rows=groups.flatMap(g=>shuffle([0,1,2]).map(i=>g*3+i));
const columnGroups=shuffle([0,1,2]);
const cols=columnGroups.flatMap(g=>shuffle([0,1,2]).map(i=>g*3+i));
const digits=shuffle([1,2,3,4,5,6,7,8,9]);
return rows.map(r=>cols.map(c=>digits[(r*3+Math.floor(r/3)+c)%9])).flat();
}
function countSolutions(values,limit=2){
let count=0;
function solve(){
if(count>=limit)return;
let best=-1;
let bestOptions=null;
for(let i=0;i<81;i++){
if(values[i]!==0)continue;
const r=Math.floor(i/9),c=i%9;
const used=new Set();
for(let j=0;j<9;j++){
used.add(values[r*9+j]);
used.add(values[j*9+c]);
}
const sr=Math.floor(r/3)*3,sc=Math.floor(c/3)*3;
for(let y=0;y<3;y++)for(let x=0;x<3;x++)used.add(values[(sr+y)*9+sc+x]);
const options=[];
for(let n=1;n<=9;n++)if(!used.has(n))options.push(n);
if(options.length===0)return;
if(bestOptions===null||options.length<bestOptions.length){
best=i;
bestOptions=options;
if(options.length===1)break;
}
}
if(best===-1){count++;return;}
for(const value of bestOptions){
values[best]=value;
solve();
values[best]=0;
if(count>=limit)return;
}
}
solve();
return count;
}
function createPuzzle(){
const difficulty=document.getElementById("difficulty").value;
const targets={easy:38,medium:46,hard:52};
const target=targets[difficulty];
solution=generateSolution();
puzzle=[...solution];
const positions=shuffle(Array.from({length:81},(_,i)=>i));
let removed=0;
for(const index of positions){
if(removed>=target)break;
const saved=puzzle[index];
puzzle[index]=0;
if(countSolutions([...puzzle])!==1)puzzle[index]=saved;
else removed++;
}
entries=[...puzzle];
}
function render(){
board.innerHTML="";
for(let i=0;i<81;i++){
const cell=document.createElement("button");
cell.type="button";
cell.className="cell";
cell.dataset.index=i;
cell.textContent=entries[i]||"";
cell.setAttribute("role","gridcell");
cell.setAttribute("aria-label",`Row ${Math.floor(i/9)+1}, column ${i%9+1}, ${entries[i]||"empty"}`);
if(puzzle[i])cell.classList.add("fixed");
if(i===selected)cell.classList.add("selected");
else if(selected>=0){
const r=Math.floor(i/9),c=i%9,sr=Math.floor(selected/9),sc=selected%9;
if(r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3)))cell.classList.add("related");
if(entries[selected]&&entries[selected]===entries[i])cell.classList.add("same");
}
if(entries[i]&&entries[i]!==solution[i])cell.classList.add("wrong");
if(entries[i]&&!puzzle[i]&&entries[i]===solution[i])cell.classList.add("correct");
cell.addEventListener("click",()=>{selected=i;render();});
board.appendChild(cell);
}
}
function updateStats(){
timerEl.textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
mistakesEl.textContent=mistakes;
hintsEl.textContent=hints;
}
function checkWin(){
if(entries.every((value,i)=>value===solution[i])){
finished=true;
clearInterval(clock);
message.textContent="🎉 Congratulations! Sudoku completed!";
}
}
function inputNumber(number){
if(finished||selected<0||puzzle[selected])return;
if(entries[selected]===number)return;
entries[selected]=number;
if(number&&number!==solution[selected]){
mistakes++;
message.textContent="Incorrect number. Try again!";
}else message.textContent=number?"Good move!":"Number erased.";
render();
updateStats();
checkWin();
}
function useHint(){
if(finished||hints<=0){message.textContent="No hints left.";return;}
const choices=entries.map((v,i)=>v!==solution[i]?i:-1).filter(i=>i>=0);
if(!choices.length)return;
const index=selected>=0&&entries[selected]!==solution[selected]?selected:choices[Math.floor(Math.random()*choices.length)];
entries[index]=solution[index];
puzzle[index]=solution[index];
selected=index;
hints--;
message.textContent="Hint added!";
render();
updateStats();
checkWin();
}
function startGame(){
clearInterval(clock);
selected=-1;mistakes=0;hints=3;seconds=0;finished=false;
createPuzzle();
message.textContent="Select a square to begin.";
render();updateStats();
clock=setInterval(()=>{if(!finished){seconds++;updateStats();}},1000);
}
document.querySelectorAll("[data-number]").forEach(button=>button.addEventListener("click",()=>inputNumber(Number(button.dataset.number))));
document.getElementById("erase").addEventListener("click",()=>inputNumber(0));
document.getElementById("hint").addEventListener("click",useHint);
document.getElementById("newGame").addEventListener("click",startGame);
document.getElementById("difficulty").addEventListener("change",startGame);
document.addEventListener("keydown",event=>{
if(document.activeElement?.tagName==="SELECT")return;
if(event.key>="1"&&event.key<="9")inputNumber(Number(event.key));
if(event.key==="Backspace"||event.key==="Delete")inputNumber(0);
if(selected>=0&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)){
event.preventDefault();
const offsets={ArrowUp:-9,ArrowDown:9,ArrowLeft:-1,ArrowRight:1};
const next=selected+offsets[event.key];
if(next>=0&&next<81){selected=next;render();}
}
});
startGame();

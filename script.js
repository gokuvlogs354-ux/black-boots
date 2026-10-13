"use strict";
// LOCAL DEMO ONLY: no secure accounts, shared database, or real authentication.
const STORAGE_KEY = "blackBootsWebsiteV1";
const initialData = {
  members: 0, roster: [],
  news: [{id:1,type:"Announcement",title:"Welcome to The Black Boots",score:"",
    body:"Our journey starts here. Help us build our community toward 100 members!",
    date:new Date().toISOString()}],
  applications: []
};
function loadData(){
  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    if(!saved)return structuredClone(initialData);
    const p=JSON.parse(saved);
    if(!p||!Array.isArray(p.roster)||!Array.isArray(p.news)||!Array.isArray(p.applications)||!Number.isFinite(p.members))return structuredClone(initialData);
    return {members:p.members,roster:p.roster,news:p.news,applications:p.applications};
  }catch{return structuredClone(initialData);}
}
let data=loadData();
function saveData(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true;}catch{alert("Could not save data. Browser storage may be full or disabled.");return false;}}
function makeId(){return Date.now()+Math.floor(Math.random()*10000);}
function escapeHTML(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function formatDate(v){const d=new Date(v);return Number.isNaN(d.getTime())?"Date unavailable":d.toLocaleDateString();}
function showMessage(id,msg,ok=true){const e=document.getElementById(id);e.textContent=msg;e.style.color=ok?"#a8e6b0":"#ff9999";}
function showPage(name){
  const page=document.getElementById(name);if(!page)return;
  document.querySelectorAll(".page").forEach(s=>s.classList.toggle("active",s.id===name));
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
  document.getElementById("navigation").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();const p=b.dataset.page;showPage(p);history.replaceState(null,"","#"+p);}));
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("navigation").classList.toggle("open"));
function renderRoster(){
  const grid=document.getElementById("rosterGrid");
  grid.innerHTML=data.roster.length?data.roster.map(p=>`<article class="player-card"><div class="player-avatar">${escapeHTML(p.name.trim().slice(0,2).toUpperCase()||"BB")}</div><h3>${escapeHTML(p.name)}</h3><span class="tag">${escapeHTML(p.position)}</span><p>THE BLACK BOOTS</p></article>`).join(""):'<div class="empty-state">No players have been added yet. Check back soon!</div>';
  document.getElementById("playerCount").textContent=data.roster.length;renderAdminRoster();
}
function renderNews(){
  const grid=document.getElementById("newsGrid");
  const sorted=[...data.news].sort((a,b)=>new Date(b.date)-new Date(a.date));
  grid.innerHTML=sorted.length?sorted.map(p=>`<article class="news-card"><span class="tag">${escapeHTML(p.type)}</span><h3>${escapeHTML(p.title)}</h3>${p.score?`<p><strong>Score: ${escapeHTML(p.score)}</strong></p>`:""}<p>${escapeHTML(p.body)}</p><time>${escapeHTML(formatDate(p.date))}</time></article>`).join(""):'<div class="empty-state">No news yet. Stay tuned.</div>';
  document.getElementById("winCount").textContent=data.news.filter(p=>p.type==="Match Result"&&/^\s*\d+\s*-\s*\d+\s*$/.test(p.score||"")&&Number(p.score.split("-")[0])>Number(p.score.split("-")[1])).length;
  renderAdminNews();
}
function renderHome(){document.getElementById("memberCount").textContent=Number(data.members).toLocaleString();document.getElementById("playerCount").textContent=data.roster.length;}
document.getElementById("tryoutForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);
  const a={id:makeId(),name:String(f.get("playerName")).trim(),position:String(f.get("position")),experience:String(f.get("experience")),discord:String(f.get("discord")).trim(),reason:String(f.get("reason")).trim(),date:new Date().toISOString()};
  if(!a.name||!a.discord||!a.reason){showMessage("tryMessage","Please complete all required fields.",false);return;}
  data.applications.push(a);if(!saveData()){data.applications.pop();return;}
  e.currentTarget.reset();showMessage("tryMessage","Demo application saved in this browser. It has NOT been sent to the team.");renderAdminApplications();
});
document.getElementById("loginForm").addEventListener("submit",e=>{
  e.preventDefault();const name=document.getElementById("loginName").value.trim(),pass=document.getElementById("loginPassword").value;
  if(!name||!pass){showMessage("loginMessage","Enter a username and password.",false);return;}
  document.getElementById("welcomeName").textContent=name;document.getElementById("memberArea").classList.remove("hidden");
  showMessage("loginMessage","Demo sign-in only. No real account was verified.");e.currentTarget.reset();
});
document.getElementById("logoutBtn").addEventListener("click",()=>{document.getElementById("memberArea").classList.add("hidden");document.getElementById("welcomeName").textContent="";showMessage("loginMessage","You have left the demo member area.");});
document.getElementById("adminOpenBtn").addEventListener("click",()=>{document.getElementById("adminPanel").classList.remove("hidden");renderAdminRoster();renderAdminNews();renderAdminApplications();});
document.getElementById("adminCloseBtn").addEventListener("click",()=>document.getElementById("adminPanel").classList.add("hidden"));
document.getElementById("memberForm").addEventListener("submit",e=>{
  e.preventDefault();const n=Number(document.getElementById("memberInput").value);
  if(!Number.isInteger(n)||n<0||n>100000){alert("Enter a whole number between 0 and 100000.");return;}
  const old=data.members;data.members=n;if(!saveData()){data.members=old;return;}renderHome();alert("Member count updated on this device.");
});
document.getElementById("rosterForm").addEventListener("submit",e=>{
  e.preventDefault();const name=document.getElementById("rosterName").value.trim(),position=document.getElementById("rosterPosition").value;if(!name||!position)return;
  const p={id:makeId(),name,position};data.roster.push(p);if(!saveData()){data.roster.pop();return;}e.currentTarget.reset();renderRoster();renderHome();
});
function renderAdminRoster(){
  const c=document.getElementById("adminRoster");if(!c)return;
  if(!data.roster.length){c.innerHTML='<p class="form-note">No roster players yet.</p>';return;}
  c.innerHTML=data.roster.map(p=>`<div class="admin-item"><div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.position)}</small></div><button class="btn danger" data-remove-player="${Number(p.id)}">REMOVE</button></div>`).join("");
  c.querySelectorAll("[data-remove-player]").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.removePlayer),old=data.roster;data.roster=old.filter(p=>p.id!==id);if(!saveData()){data.roster=old;return;}renderRoster();renderHome();}));
}
document.getElementById("newsForm").addEventListener("submit",e=>{
  e.preventDefault();const title=document.getElementById("newsTitle").value.trim(),type=document.getElementById("newsType").value,score=document.getElementById("newsScore").value.trim(),body=document.getElementById("newsBody").value.trim();
  if(!title||!body)return;if(type==="Match Result"&&score&&!/^\d+\s*-\s*\d+$/.test(score)){alert("For a match result, enter a score such as 3-1.");return;}
  const p={id:makeId(),type,title,score,body,date:new Date().toISOString()};data.news.push(p);if(!saveData()){data.news.pop();return;}e.currentTarget.reset();renderNews();alert("Post published on this device.");
});
function renderAdminNews(){
  const c=document.getElementById("adminNews");if(!c)return;
  if(!data.news.length){c.innerHTML='<p class="form-note">No posts yet.</p>';return;}
  c.innerHTML=[...data.news].reverse().map(p=>`<div class="admin-item"><div><strong>${escapeHTML(p.title)}</strong><small>${escapeHTML(p.type)} · ${escapeHTML(formatDate(p.date))}</small></div><button class="btn danger" data-remove-news="${Number(p.id)}">DELETE</button></div>`).join("");
  c.querySelectorAll("[data-remove-news]").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.removeNews),old=data.news;data.news=old.filter(p=>p.id!==id);if(!saveData()){data.news=old;return;}renderNews();}));
}
function renderAdminApplications(){
  const c=document.getElementById("adminApplications");if(!c)return;
  if(!data.applications.length){c.innerHTML='<p class="form-note">No applications saved on this device.</p>';return;}
  c.innerHTML=[...data.applications].reverse().map(a=>`<article class="admin-item"><div><strong>${escapeHTML(a.name)}</strong><small>${escapeHTML(a.position)} · ${escapeHTML(a.experience)}</small><small>Discord: ${escapeHTML(a.discord)}</small><small>${escapeHTML(a.reason)}</small><small>${escapeHTML(formatDate(a.date))}</small></div><button class="btn danger" data-remove-application="${Number(a.id)}">DELETE</button></article>`).join("");
  c.querySelectorAll("[data-remove-application]").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.removeApplication),old=data.applications;data.applications=old.filter(a=>a.id!==id);if(!saveData()){data.applications=old;return;}renderAdminApplications();}));
}
document.getElementById("resetDemo").addEventListener("click",()=>{
  if(!confirm("Delete all local demo roster entries, posts, applications, and member count?"))return;
  data=structuredClone(initialData);if(!saveData())return;
  document.getElementById("tryMessage").textContent="";document.getElementById("loginMessage").textContent="";
  document.getElementById("memberArea").classList.add("hidden");document.getElementById("adminPanel").classList.add("hidden");renderAll();alert("Demo data has been reset.");
});
function renderAll(){renderHome();renderRoster();renderNews();renderAdminApplications();}
renderAll();
const initialPage=window.location.hash.slice(1);if(document.getElementById(initialPage)?.classList.contains("page"))showPage(initialPage);

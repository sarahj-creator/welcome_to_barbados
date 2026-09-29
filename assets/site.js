(function(){
  function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function img(id,w,h){return "https://images.unsplash.com/photo-"+id+"?auto=format&fit=crop&w="+w+(h?"&h="+h:"")+"&q=70"}

  /* ---------- photo loading with neutral fallback ---------- */
  function watchPhotos(root){
    (root||document).querySelectorAll(".photo img").forEach(function(im){
      var f=im.closest(".photo"); if(f.dataset.w)return; f.dataset.w="1";
      function ok(){f.classList.add("loaded")} function bad(){f.classList.add("noimg")}
      if(im.complete&&im.getAttribute("loading")!=="lazy"){im.naturalWidth?ok():bad()}
      else if(im.complete&&im.naturalWidth){ok()}
      im.addEventListener("load",ok);im.addEventListener("error",bad);
    });
  }

  /* ---------- old #/ links: send to the new page addresses ---------- */
  var OLD={"visas":"/residency-and-visas/","cost":"/cost-of-living/","where":"/where-to-live/","healthcare":"/healthcare/","schools":"/schools/","setup":"/setting-up/","checklist":"/moving-checklist/","quiz":"/parish-quiz/","resources":"/resources/","about":"/about/","contact":"/contact/","privacy":"/privacy/"};
  if(location.hash.indexOf("#/")===0){var k=location.hash.slice(2).split("?")[0];if(OLD.hasOwnProperty(k)){location.replace(OLD[k]);return}}

  /* ---------- highlight the current page in the nav ---------- */
  var here=location.pathname.replace(/index\.html$/,"");
  document.querySelectorAll("nav.main a").forEach(function(a){if(a.getAttribute("href")===here&&!a.closest(".nav-cta"))a.setAttribute("aria-current","page")});

  /* ---------- nav ---------- */
  var menuBtn=document.querySelector(".menu-btn"),nav=document.getElementById("mainnav"),dds=document.querySelectorAll("button.dd");
  function closeDropdowns(except){dds.forEach(function(b){if(b!==except){b.setAttribute("aria-expanded","false");document.getElementById(b.getAttribute("aria-controls")).classList.remove("open")}})}
  function closeMenus(){nav.classList.remove("open");menuBtn.setAttribute("aria-expanded","false");menuBtn.textContent="Menu";document.body.style.overflow="";closeDropdowns()}
  menuBtn.addEventListener("click",function(){var o=nav.classList.toggle("open");menuBtn.setAttribute("aria-expanded",o);menuBtn.textContent=o?"Close":"Menu";document.body.style.overflow=o?"hidden":""});
  dds.forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();closeDropdowns(b);var m=document.getElementById(b.getAttribute("aria-controls"));var o=m.classList.toggle("open");b.setAttribute("aria-expanded",o)})});
  document.addEventListener("click",function(e){if(!e.target.closest(".has-dd"))closeDropdowns()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){var open=document.querySelector("button.dd[aria-expanded='true']");closeMenus();if(open)open.focus()}});

  /* ---------- forms ---------- */
  var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var FORMSPREE_URL="https://formspree.io/f/mvkgdgna";
  var CHECKLIST_PDF="/barbados-moving-checklist.pdf";
  function wireForm(f){
    f.addEventListener("submit",function(e){
      e.preventDefault();
      var msg=f.querySelector(".msg");msg.className="msg";msg.textContent="";var bad=null;
      f.querySelectorAll("[required]").forEach(function(i){if(!bad&&!i.value.trim())bad={el:i,t:"Fill in "+i.labels[0].textContent.replace(/\(.*\)/,"").trim().toLowerCase()+"."}});
      var em=f.querySelector('input[type="email"]');
      if(!bad&&em&&em.value.trim()&&!emailRe.test(em.value.trim()))bad={el:em,t:"Enter an email address like name@example.com."};
      var url=f.querySelector('input[type="url"]');
      if(!bad&&url&&url.value.trim()&&!/^https?:\/\/\S+\.\S+/.test(url.value.trim()))bad={el:url,t:"Enter a full link starting with https://"};
      if(bad){msg.classList.add("err");msg.textContent=bad.t;bad.el.setAttribute("aria-invalid","true");bad.el.focus();return}
      f.querySelectorAll("[aria-invalid]").forEach(function(i){i.removeAttribute("aria-invalid")});
      var type=f.dataset.form;
      /* All forms go to Formspree. Signups get the checklist PDF straight away. */
      var isSignup=(type==="lead"||type==="quiz");
      var btn=f.querySelector('button[type="submit"]'),label=btn.textContent;
      btn.disabled=true;btn.textContent="Sending…";
      var data=new FormData(f);
      var names={lead:"Checklist signup",quiz:"Checklist signup (from quiz)",contact:"Contact message",suggestion:"Resource suggestion"};
      var subjects={lead:"New checklist signup",quiz:"New checklist signup from the quiz",contact:"New message from Moving to Barbados",suggestion:"New resource suggestion for Moving to Barbados"};
      data.append("form_type",names[type]);
      data.append("_subject",subjects[type]);
      if(type==="quiz"){var qr=load("mtb-quiz",null);if(qr&&qr.result)data.append("quiz_result",qr.result.join(", "))}
      fetch(FORMSPREE_URL,{method:"POST",body:data,headers:{Accept:"application/json"}})
        .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{ok:r.ok,j:j}})})
        .then(function(res){
          if(res.ok){
            msg.classList.add("ok");
            if(isSignup){
              msg.textContent="Thanks. You're on the list. ";
              var a=document.createElement("a");a.href=CHECKLIST_PDF;a.target="_blank";a.rel="noopener";a.textContent="Download your checklist (PDF)";msg.appendChild(a);
            } else {
              msg.textContent=type==="contact"?"Thanks. Your message has been sent, and you'll get a reply by email.":"Thanks. Your suggestion has been sent for checking.";
            }
            f.reset();
          }
          else{msg.classList.add("err");msg.textContent=(res.j.errors&&res.j.errors.length?res.j.errors.map(function(x){return x.message}).join(" "):"That didn't send.")+" Please try again in a moment."}
        })
        .catch(function(){msg.classList.add("err");msg.textContent="That didn't send. Check your connection and try again."})
        .then(function(){btn.disabled=false;btn.textContent=label});
    });
  }
  document.querySelectorAll("form[data-form]").forEach(wireForm);

  /* ---------- parishes ---------- */
  var parishes=[
    {n:"St. Michael",ph:"1655993084234-16b5ee45d8c3",alt:"A boat docked beside the water in Bridgetown",tr:"Capital · Services · Buses",d:"Home to Bridgetown, the capital. Most government offices, shops and services are here.",suits:"People who want convenience and shorter commutes, and those working in town.",pros:"Services on the doorstep, good bus links.",cons:"Busier, with more traffic and fewer quiet beaches.",t:["families","budget","remote"]},
    {n:"Christ Church",ph:"1636532975297-1a2385782f4e",alt:"People swimming off a sandy beach",tr:"South coast · Lively · Near the airport",d:"The south coast, with a lively strip of beaches, restaurants and nightlife, including Oistins.",suits:"Remote workers, couples and people who like being near things to do.",pros:"Beaches, food, good buses, close to the airport.",cons:"Can be noisy in busier areas.",t:["remote","beach","families"]},
    {n:"St. James",ph:"1566159269137-ccf6e35a126e",alt:"Palm trees along a calm sandy beach",tr:"West coast · Calm sea · Established",d:"The west coast, with calm Caribbean water and many upscale homes.",suits:"Retirees and people with a flexible budget who want calm sea.",pros:"Calm beaches, sunsets, an established expat community.",cons:"Usually the most expensive area to rent or buy.",t:["retirees","beach"]},
    {n:"St. Peter",ph:"1654605651026-cddace188530",alt:"Palm trees lining a quiet shoreline",tr:"North-west · Slower pace · Historic town",d:"The north-west coast around Speightstown, quieter than St. James.",suits:"People wanting west coast calm at a slower pace.",pros:"Calm water, a historic town, a relaxed feel.",cons:"Further from Bridgetown and the airport.",t:["retirees","beach","remote"]},
    {n:"St. Lucy",ph:"1633847016930-b03b173b4381",alt:"A bench on a rocky clifftop above the ocean",tr:"Northern tip · Rural · Dramatic coast",d:"The rural northern tip, with dramatic clifftop coastline.",suits:"People seeking peace, space and lower costs.",pros:"Quiet, scenic, often more affordable.",cons:"A car is almost essential; far from main services.",t:["budget","retirees"]},
    {n:"St. Andrew",ph:"1657549195441-5bf271bf7180",alt:"A beach below a hill covered in trees",tr:"East · Hills · Remote",d:"Rugged hills on the east side, facing the Atlantic.",suits:"Nature lovers happy to be remote.",pros:"Stunning scenery, very peaceful.",cons:"Rough sea for swimming; long drives to services.",t:["budget"]},
    {n:"St. Joseph",ph:"1636728163078-59ea0afb7665",alt:"Waves rolling onto a sandy shore",tr:"East coast · Surf · Wild",d:"The east coast parish that includes Bathsheba and the Atlantic surf.",suits:"Surfers, creatives and people who love wild coastline.",pros:"Dramatic views, cooler breeze, quiet.",cons:"The Atlantic is often unsafe for swimming; remote.",t:["budget"]},
    {n:"St. Philip",ph:"1633847016225-d7322e0d73e6",alt:"The sea seen from a quiet beach",tr:"South-east · Space · Newer homes",d:"The south-east, with residential developments and beaches such as Crane.",suits:"Families wanting space and newer housing.",pros:"More space, beautiful beaches, near the airport.",cons:"A car is needed; fewer amenities in some areas.",t:["families","beach"]},
    {n:"St. George",ph:"1591304446364-799bf3f3b806",alt:"Open green fields under a blue sky",tr:"Central · Inland · Agricultural",d:"Central, inland and largely agricultural.",suits:"Families and people on a budget who don't mind driving.",pros:"Central, more affordable, a community feel.",cons:"No coastline; a car is needed.",t:["families","budget"]},
    {n:"St. Thomas",ph:"1633847016541-c4a1f7227183",alt:"A building among dense tropical trees",tr:"Central · Green · Cooler",d:"A central inland parish with greenery and cooler air.",suits:"People wanting a central, quieter base.",pros:"Central, green, often more affordable.",cons:"No coastline; a car is needed.",t:["families","budget"]},
    {n:"St. John",ph:"1672106411651-94f881e5b957",alt:"A person standing on a beach looking out to sea",tr:"East · Hilltop views · Village life",d:"A hilly parish on the east side with sweeping views.",suits:"People wanting quiet village life.",pros:"Peaceful, scenic, traditional feel.",cons:"Remote from services; a car is needed.",t:["budget","retirees"]}
  ];
  function parishCard(p){
    var el=document.createElement("article");el.className="parish";
    var fig=document.createElement("figure");fig.className="photo r-land";fig.dataset.label=p.n;
    var im=document.createElement("img");im.loading="lazy";im.width=900;im.height=600;im.src=img(p.ph,900,600);im.alt=p.alt;fig.appendChild(im);
    el.appendChild(fig);
    var tr=document.createElement("p");tr.className="traits";tr.textContent=p.tr;
    var h=document.createElement("h3");h.textContent=p.n;
    var d=document.createElement("p");d.textContent=p.d;
    var dl=document.createElement("dl");
    [["Suits",p.suits],["Advantages",p.pros],["Consider",p.cons]].forEach(function(r){var w=document.createElement("div"),dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=r[0];dd.textContent=r[1];w.appendChild(dt);w.appendChild(dd);dl.appendChild(w)});
    el.appendChild(tr);el.appendChild(h);el.appendChild(d);el.appendChild(dl);
    return el;
  }
  var grid=document.getElementById("parish-grid"),count=document.getElementById("parish-count");
  function renderParishes(f){grid.innerHTML="";var list=parishes.filter(function(p){return f==="all"||p.t.indexOf(f)>-1});list.forEach(function(p){grid.appendChild(parishCard(p))});count.textContent="Showing "+list.length+" of 11 parishes";watchPhotos(grid)}
  if(grid)document.querySelectorAll(".filters button").forEach(function(b){b.addEventListener("click",function(){document.querySelectorAll(".filters button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});renderParishes(b.dataset.f)})});
  if(grid){renderParishes("all")}

  /* ---------- quiz ---------- */
  var Q=[
    {q:"What matters most day to day?",o:[["Being near the beach","beach"],["Peace, quiet and nature","quiet"],["Convenience and services","town"],["Food, social life and things to do","social"]]},
    {q:"How would you describe your housing budget?",o:[["Tight, I need to keep costs down","low"],["Moderate","mid"],["Flexible","high"]]},
    {q:"Who's moving?",o:[["Just me","solo"],["A couple","couple"],["A family with children","family"],["We're retiring","retire"]]},
    {q:"How will you work?",o:[["Remotely, for work outside Barbados","remote"],["A local job, likely in or near Bridgetown","local"],["I'm retired or not working","none"]]},
    {q:"Will you have a car?",o:[["Yes","car"],["No, I want buses and walkable areas","nocar"]]},
    {q:"What kind of sea do you prefer?",o:[["Calm water for swimming","calm"],["Wild Atlantic views","wild"],["I don't mind","any"]]}
  ];
  var W={
    "St. Michael":{town:3,social:1,low:2,mid:1,family:2,solo:1,local:3,remote:1,nocar:3,car:1,any:1},
    "Christ Church":{beach:2,social:3,town:1,mid:2,low:1,solo:2,couple:2,family:1,remote:3,nocar:2,car:1,calm:2,any:1},
    "St. James":{beach:3,high:3,couple:2,retire:3,none:2,remote:1,calm:3,car:1},
    "St. Peter":{beach:2,quiet:2,mid:2,high:1,retire:2,couple:1,remote:2,none:1,calm:3,car:1},
    "St. Lucy":{quiet:3,low:2,retire:1,solo:1,none:1,remote:1,car:2,wild:2,any:1},
    "St. Andrew":{quiet:3,low:2,solo:1,remote:1,car:2,wild:3},
    "St. Joseph":{quiet:3,low:1,mid:1,solo:1,couple:1,remote:1,car:2,wild:3},
    "St. Philip":{beach:1,quiet:2,mid:2,family:3,remote:1,local:1,car:2,any:1,calm:1},
    "St. George":{quiet:1,town:1,low:3,family:3,local:2,car:2,any:1},
    "St. Thomas":{quiet:2,low:2,mid:1,family:2,local:2,car:2,any:1},
    "St. John":{quiet:3,low:2,retire:1,couple:1,car:2,wild:2}
  };
  var box=document.getElementById("quiz-box"),step=0,answers=[];
  function renderQ(){
    if(step>=Q.length)return renderResult();
    var q=Q[step];box.innerHTML="";
    var wrap=document.createElement("div");wrap.className="quiz-step";
    wrap.innerHTML='<div class="qprog"><span>Question '+(step+1)+' of '+Q.length+'</span><div class="qbar" aria-hidden="true"><span style="width:'+((step)/Q.length*100)+'%"></span></div></div>';
    var fs=document.createElement("fieldset"),lg=document.createElement("legend");lg.textContent=q.q;lg.setAttribute("tabindex","-1");fs.appendChild(lg);
    q.o.forEach(function(o){var l=document.createElement("label");l.className="opt";var r=document.createElement("input");r.type="radio";r.name="q";r.value=o[1];if(answers[step]===o[1])r.checked=true;var s=document.createElement("span");s.textContent=o[0];l.appendChild(r);l.appendChild(s);fs.appendChild(l)});
    wrap.appendChild(fs);
    var row=document.createElement("div");row.className="btn-row";
    if(step>0){var b=document.createElement("button");b.type="button";b.className="btn line";b.textContent="Back";b.onclick=function(){step--;renderQ();focusQ()};row.appendChild(b)}
    var n=document.createElement("button");n.type="button";n.className="btn";n.textContent=step===Q.length-1?"See my results":"Next question";
    var err=document.createElement("p");err.className="msg err";err.setAttribute("role","alert");
    n.onclick=function(){var c=box.querySelector('input[name="q"]:checked');if(!c){err.textContent="Choose an answer to continue.";return}answers[step]=c.value;step++;renderQ();focusQ()};
    row.appendChild(n);wrap.appendChild(row);wrap.appendChild(err);box.appendChild(wrap);
  }
  function focusQ(){var f=box.querySelector("legend,h2");if(f)f.focus()}
  function renderResult(){
    var scores=Object.keys(W).map(function(p){var s=0;answers.forEach(function(a){s+=(W[p][a]||0)});return[p,s]}).sort(function(a,b){return b[1]-a[1]});
    var top=scores.slice(0,2).map(function(s){return parishes.filter(function(p){return p.n===s[0]})[0]});
    save("mtb-quiz",{answers:answers,result:top.map(function(p){return p.n})});
    box.innerHTML="";var r=document.createElement("div");r.className="result quiz-step";
    r.innerHTML='<div class="qprog"><span>Complete</span><div class="qbar" aria-hidden="true"><span style="width:100%"></span></div></div>';
    var h=document.createElement("h2");h.textContent="Two parishes to explore first";h.setAttribute("tabindex","-1");r.appendChild(h);
    var nt=document.createElement("p");nt.className="lede";nt.textContent="This is a starting point based on six answers, not a recommendation. Visit both, at different times of day, and compare them with the other parishes before deciding.";r.appendChild(nt);
    var g=document.createElement("div");g.className="parish-grid";g.style.margin="2rem 0";top.forEach(function(p){g.appendChild(parishCard(p))});r.appendChild(g);
    var nx=document.createElement("p");nx.innerHTML='Next: compare all 11 on <a href="/where-to-live/">Where to live</a>, check prices on <a href="/cost-of-living/">Cost of living</a>, and plan with the <a href="/moving-checklist/">moving checklist</a>.';r.appendChild(nx);
    var f=document.createElement("form");f.className="f inline";f.dataset.form="quiz";f.setAttribute("novalidate","");f.style.marginTop="2rem";
    f.innerHTML='<div style="position:absolute;left:-9999px" aria-hidden="true"><label for="q-gotcha">Leave this empty</label><input id="q-gotcha" type="text" name="_gotcha" tabindex="-1" autocomplete="off"></div><div><label for="q-email">Get the free moving checklist <span class="req">(enter your email)</span></label><input id="q-email" name="email" type="email" autocomplete="email" required></div><button class="btn" type="submit">Get the checklist</button><p class="fine" style="grid-column:1/-1;margin:0">We\'ll only email you about moving to Barbados. Unsubscribe anytime. <a href="/privacy/">Privacy Policy</a></p><p class="msg" role="status" aria-live="polite" style="grid-column:1/-1;margin:0"></p>';
    r.appendChild(f);wireForm(f);
    var again=document.createElement("button");again.type="button";again.className="btn line";again.textContent="Retake the quiz";again.style.marginTop="2rem";again.onclick=function(){step=0;answers=[];renderQ();focusQ()};r.appendChild(again);
    box.appendChild(r);watchPhotos(box);
  }
  if(box)renderQ();

  /* ---------- checklist ---------- */
  var phases=[
    {k:"p1",n:"Six months before",items:[
      ["Choose your visa or residency route","Compare the Welcome Stamp, SERP and work permit routes."],
      ["Set a realistic monthly budget","Use the cost of living calculator."],
      ["Shortlist two or three parishes","Take the parish quiz and read the parish guides."],
      ["Check passports are valid","Allow plenty of time before expiry."],
      ["Contact shortlisted schools","Ask about places, fees, deadlines and document rules."],
      ["Start the pet import process","Microchip, rabies vaccine and any blood test can take months."],
      ["Get quotes from shipping companies","Compare at least three."],
      ["Ask your bank for a reference letter","Local banks usually want one."]
    ]},
    {k:"p2",n:"One month before",items:[
      ["Submit or confirm your visa application","Keep copies of everything."],
      ["Arrange health insurance to start on arrival","Check evacuation cover and what's covered locally."],
      ["Book temporary accommodation","Somewhere to stay while you view rentals in person."],
      ["Gather key documents in one folder","Birth, marriage, school and medical records, driving licence."],
      ["Get a letter from your doctor and refill prescriptions","Bring enough for your first weeks, in original packaging."],
      ["Notify banks, pension and tax authorities at home","Update your address and residency."],
      ["Cancel or transfer home utilities and subscriptions","Avoid paying for services you won't use."]
    ]},
    {k:"p3",n:"First week",items:[
      ["Get a local SIM","Prepaid is quickest. Bring your passport."],
      ["Save emergency numbers","Ambulance 511, Police 211, Fire 311."],
      ["Learn your bus routes or arrange a car","Flat BBD $3.50 fare. Barbados drives on the left."],
      ["Book a bank account appointment","Bring two photo IDs, proof of address and your reference letter."],
      ["View rentals in your shortlisted parishes","Visit at different times of day."],
      ["Find your nearest pharmacy and a private GP","Before you need them."],
      ["Stock up on essentials","Compare supermarkets and local markets."]
    ]},
    {k:"p4",n:"First three months",items:[
      ["Sign a longer-term lease","Check who pays which utility bills."],
      ["Set up electricity, water and internet","Get the tenant advice form from your landlord first."],
      ["Get your Trident ID, then your local driving licence","Licensing Authority, The Pine. Cash only."],
      ["Register children at school","Bring all enrolment documents."],
      ["Join a community group or club","The fastest way to meet people."],
      ["Review your budget against real spending","Adjust now rather than later."],
      ["Put visa renewal dates in your calendar","Leave time for paperwork."]
    ]}
  ];
  var ticks=load("mtb-checklist",{}),list=document.getElementById("cl-list");
  function renderChecklist(){
    list.innerHTML="";var total=0,done=0;
    phases.forEach(function(ph,pi){
      var sec=document.createElement("section");sec.className="phase";var d=0;
      ph.items.forEach(function(_,i){if(ticks[ph.k+"-"+i])d++});total+=ph.items.length;done+=d;
      var pct=Math.round(d/ph.items.length*100);
      sec.innerHTML='<div class="phase-head"><h2><span class="phase-num">'+(pi+1)+'.</span></h2><span class="fine"></span></div><div class="progress" aria-hidden="true"><span style="width:'+pct+'%"></span></div>';
      sec.querySelector("h2").appendChild(document.createTextNode(ph.n));sec.querySelector(".fine").textContent=d+" of "+ph.items.length+" done";
      ph.items.forEach(function(it,i){
        var key=ph.k+"-"+i,id="cl-"+key,l=document.createElement("label");l.className="item"+(ticks[key]?" done":"");l.setAttribute("for",id);
        var c=document.createElement("input");c.type="checkbox";c.id=id;c.checked=!!ticks[key];
        c.addEventListener("change",function(){ticks[key]=c.checked;save("mtb-checklist",ticks);renderChecklist();var el=document.getElementById(id);if(el)el.focus()});
        var s=document.createElement("span"),t=document.createElement("span");t.className="t";t.textContent=it[0];var ds=document.createElement("span");ds.className="d";ds.textContent=it[1];
        s.appendChild(t);s.appendChild(ds);l.appendChild(c);l.appendChild(s);sec.appendChild(l);
      });
      list.appendChild(sec);
    });
    var op=Math.round(done/total*100);
    document.getElementById("cl-overall").style.width=op+"%";
    document.getElementById("cl-overall-pct").textContent=op+"%";
    document.getElementById("cl-overall-text").textContent=done+" of "+total+" steps done";
  }
  if(list){renderChecklist();
  document.getElementById("cl-print").addEventListener("click",function(){try{window.print()}catch(e){}});
  document.getElementById("cl-reset").addEventListener("click",function(){ticks={};save("mtb-checklist",ticks);renderChecklist()});}

  /* ---------- resources ---------- */
  var res=[
    ["Government",[["Barbados Welcome Stamp","Official remote work visa information and applications.","https://www.barbadoswelcomestamp.bb/"],["Immigration Department: Special Entry Permit","SERP categories, fees and requirements.","https://immigration.gov.bb/pages/SpecialEntryPermit.aspx"],["Immigration Department: Work Permits","How employer-sponsored work permits work.","https://immigration.gov.bb/pages/WorkPermit.aspx"],["Barbados Network Programme","Support for returning nationals and the diaspora.","https://www.foreign.gov.bb/barbados-network-programme/"]]],
    ["Healthcare",[["Ministry of Health and Wellness","Public health services and polyclinics.","https://health.gov.bb/"],["Queen Elizabeth Hospital","The main public hospital.","https://www.qehconnect.com/"]]],
    ["Schools",[["Ministry of Education","School system, term dates and enrolment.","https://education.gov.bb/"],["The Codrington School","IB World School in St. John, ages 3 to 18.","https://codrington.edu.bb/"],["Lockerbie College","Small-class private school, ages 8 to 18.","https://www.lockerbiecollege.com/"]]],
    ["Utilities & telecoms",[["Barbados Light & Power","Electricity accounts and tenant guidance.","https://www.blpc.com.bb/"],["Barbados Water Authority","Water accounts and new connections.","https://barbadoswaterauthority.com/"],["Flow Barbados","Mobile and home broadband.","https://www.flowcaribbean.com/barbados"],["Digicel Barbados","Mobile and home broadband.","https://www.digicelgroup.com/bb"]]],
    ["Community",[["r/Barbados","Local Reddit community for questions and local knowledge.","https://www.reddit.com/r/Barbados/"]]]
  ];
  var rl=document.getElementById("res-list");
  if(rl)res.forEach(function(cat){
    var sec=document.createElement("section");sec.className="res-cat";
    var h=document.createElement("h2");h.textContent=cat[0];sec.appendChild(h);
    var g=document.createElement("div");g.className="res-list";
    cat[1].forEach(function(r){var t=document.createElement("div");t.className="res";var h3=document.createElement("h3");var a=document.createElement("a");a.href=r[2];a.target="_blank";a.rel="noopener noreferrer";a.textContent=r[0];h3.appendChild(a);var p=document.createElement("p");p.textContent=r[1];t.appendChild(h3);t.appendChild(p);g.appendChild(t)});
    sec.appendChild(g);rl.appendChild(sec);
  });

  /* ---------- calculator ---------- */
  var calc=document.getElementById("calc");
  function fmt(n){return n.toLocaleString("en-GB",{maximumFractionDigits:0})}
  if(calc)calc.addEventListener("input",function(){var s=0;calc.querySelectorAll("input").forEach(function(i){var v=parseFloat(i.value);if(!isNaN(v)&&v>0)s+=v});
    document.getElementById("calc-total").textContent="BBD "+fmt(s);
    document.getElementById("calc-usd").textContent="About USD "+fmt(s/2)+" a month";
    document.getElementById("calc-year").textContent="BBD "+fmt(s*12)+" a year"});

  watchPhotos();
})();

/* Booking builder — Dr. William Castedo, DDS
   EDIT PRICING HERE. Day 1 is full rate; each later day gets the discount shown. */
var CONFIG = {
  dayRate: 6500,                       // full rate for day one, USD
  dayDiscount: [0, .10, .15, .20, .25],// discount applied to day 1,2,3,4,5
  travelEstimate: 1750,                // flat travel estimate added to every visit
  topicsPerDay: 2,
  email: "william.castedo@gmail.com"
};

var TOPICS = [
  ["Simple Implant Placement","Single-tooth surgery, site assessment and torque"],
  ["Complex Full-Arch Reconstruction","Sequencing, reduction and the prosthetic endgame"],
  ["Pterygoid Implant Placement","Posterior maxilla anchorage without grafting"],
  ["Zygomatic Implants","Case selection, trajectory and same-day loading"],
  ["Sinus Lifts","Lateral and crestal, membrane and graft management"],
  ["Case Analysis & Treatment Planning","Work through your CBCTs and charts together"],
  ["Digital Workflows for Full Arch","Photogrammetry, Grammetry, verification, file path"],
  ["GuidedSMILE Protocols with Conversion","CHROME surgery through prosthetic conversion"],
  ["FP1 Surgery & Planning","Bone-preserving position, emergence, tissue"],
  ["Overdenture Surgery & Digital Restorative","Locator and bar-Locator, start to delivery"],
  ["Consultation & Case Closing","Presenting full arch and answering the money question"],
  ["Fast All-on-X Under Two Hours","Choreography, instrumentation, assistant roles"],
  ["Revision & Rescue Surgery","Failing arches, misplaced implants, what to salvage"]
];

(function(){
  var daysEl=document.getElementById('days'), topicsEl=document.getElementById('topics');
  if(!daysEl||!topicsEl) return;
  var rowsEl=document.getElementById('rows'), chipsEl=document.getElementById('chips'),
      counterEl=document.getElementById('counter'), form=document.getElementById('bookForm');
  var state={days:0,picked:[]};
  var money=function(n){return '$'+n.toLocaleString('en-US')};

  function discount(i){
    var d=CONFIG.dayDiscount;
    return (i<d.length) ? d[i] : d[d.length-1];   // 0 is a real value, so no ||
  }
  function dayPrice(i){ return Math.round(CONFIG.dayRate*(1-discount(i))) }
  function trainingTotal(){ var t=0; for(var i=0;i<state.days;i++) t+=dayPrice(i); return t }
  function cap(){ return state.days*CONFIG.topicsPerDay }

  // day buttons
  for(var d=1;d<=5;d++){
    (function(d){
      var b=document.createElement('button');
      b.type='button'; b.className='day'; b.setAttribute('aria-pressed','false');
      b.innerHTML='<b>'+d+'</b><small>'+(d===1?'day':'days')+(d>1?' &middot; save '+Math.round(CONFIG.dayDiscount[d-1]*100)+'%':'')+'</small>';
      b.addEventListener('click',function(){ state.days=(state.days===d?0:d); trim(); render() });
      daysEl.appendChild(b);
    })(d);
  }

  // topic checkboxes
  TOPICS.forEach(function(t,i){
    var l=document.createElement('label');
    l.className='topic';
    l.innerHTML='<input type="checkbox" value="'+i+'"><span><b>'+t[0]+'</b><span>'+t[1]+'</span></span>';
    l.querySelector('input').addEventListener('change',function(e){
      var idx=state.picked.indexOf(i);
      if(e.target.checked){
        if(state.picked.length>=cap()){ e.target.checked=false; return }
        if(idx<0) state.picked.push(i);
      } else if(idx>-1){ state.picked.splice(idx,1) }
      render();
    });
    topicsEl.appendChild(l);
  });

  function trim(){ while(state.picked.length>cap()) state.picked.pop() }

  function render(){
    [].forEach.call(daysEl.children,function(b,i){ b.setAttribute('aria-pressed', state.days===i+1?'true':'false') });
    var full=state.picked.length>=cap();
    [].forEach.call(topicsEl.children,function(l,i){
      var cb=l.querySelector('input'), on=state.picked.indexOf(i)>-1;
      cb.checked=on; cb.disabled=(!on&&full);
      l.classList.toggle('is-picked',on);
      l.classList.toggle('is-full',!on&&full);
    });
    counterEl.textContent = state.days===0 ? 'Choose your days first'
      : state.picked.length+' of '+cap()+' selected';

    var rows='';
    if(state.days===0){
      rows='<div class="srow"><span>No days selected yet</span><b>&mdash;</b></div>';
    } else {
      for(var i=0;i<state.days;i++){
        rows+='<div class="srow"><span>Day '+(i+1)+(discount(i)>0?' <small>'+Math.round(discount(i)*100)+'% off</small>':'')+'</span><b>'+money(dayPrice(i))+'</b></div>';
      }
      rows+='<div class="srow"><span>Travel <small>estimate, trued up after booking</small></span><b>'+money(CONFIG.travelEstimate)+'</b></div>';
      rows+='<div class="srow total"><span>Estimate</span><b>'+money(trainingTotal()+CONFIG.travelEstimate)+'</b></div>';
    }
    rowsEl.innerHTML=rows;
    chipsEl.innerHTML=state.picked.map(function(i){ return '<span>'+TOPICS[i][0]+'</span>' }).join('');
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var f=new FormData(form), g=function(k){ return (f.get(k)||'').toString().trim() };
    if(state.days===0){ alert('Choose how many days you would like first.'); return }
    if(!g('name')||!g('email')){ alert('Please add your name and email so Dr. Castedo can reply.'); return }
    var lines=[
      'Training request for Dr. William Castedo, DDS','',
      'Days requested: '+state.days,
      'Topics ('+state.picked.length+'):',
      state.picked.length? state.picked.map(function(i){ return '  - '+TOPICS[i][0] }).join('\n') : '  - to be decided together','',
      'Estimate: '+money(trainingTotal())+' training + '+money(CONFIG.travelEstimate)+' travel = '+money(trainingTotal()+CONFIG.travelEstimate),'',
      'Name: '+g('name'),
      'Practice: '+g('practice'),
      'Email: '+g('email'),
      'Phone: '+g('phone'),
      'City & state: '+g('city'),
      'Preferred dates: '+g('dates'),'',
      'Notes:', g('notes')||'(none)'
    ].join('\n');
    window.location.href='mailto:'+CONFIG.email+'?subject='+encodeURIComponent('Training request: '+state.days+' day'+(state.days>1?'s':'')+' — '+(g('practice')||g('name')))+'&body='+encodeURIComponent(lines);
  });

  render();
})();

/* Cases Shared — Dr. William Castedo, DDS
   ------------------------------------------------------------------
   HOW TO ADD A CASE
   1. Drop four images into images/cases/ using these names:
        case-01-before.jpg        clinical photo, before
        case-01-after.jpg         clinical photo, after
        case-01-pano-before.jpg   panoramic radiograph, before
        case-01-pano-after.jpg    panoramic radiograph, after
      (jpg or png both work — just match the name in the "img" field below)
   2. Fill in the title, date, tags and notes for that case number here.
   Anything left blank shows a placeholder, so the page never looks broken.
   ------------------------------------------------------------------ */

var CASES = [
  { n:1,  title:"Maxillary full arch, immediate load", date:"", tags:["Full arch","Immediate load"], notes:"" },
  { n:2,  title:"Mandibular full arch, guided",        date:"", tags:["Full arch","Guided"],        notes:"" },
  { n:3,  title:"Zygomatic rehabilitation",            date:"", tags:["Zygoma","Severe atrophy"],   notes:"" },
  { n:4,  title:"Pterygoid anchorage, posterior maxilla", date:"", tags:["Pterygoid"],              notes:"" },
  { n:5,  title:"All-on-X, single visit",              date:"", tags:["All-on-X"],                  notes:"" },
  { n:6,  title:"Revision of failing full arch",       date:"", tags:["Revision"],                  notes:"" },
  { n:7,  title:"FP1 restoration, anterior",           date:"", tags:["FP1"],                       notes:"" },
  { n:8,  title:"Sinus lift with simultaneous placement", date:"", tags:["Sinus lift"],             notes:"" },
  { n:9,  title:"Single-tooth implant, esthetic zone", date:"", tags:["Single tooth"],              notes:"" },
  { n:10, title:"Bar-Locator overdenture",             date:"", tags:["Overdenture"],               notes:"" },
  { n:11, title:"Terminal dentition to fixed prosthesis", date:"", tags:["Full arch"],              notes:"" },
  { n:12, title:"GuidedSMILE with prosthetic conversion", date:"", tags:["GuidedSMILE","Conversion"], notes:"" },
  { n:13, title:"Dual arch rehabilitation",            date:"", tags:["Dual arch"],                 notes:"" },
  { n:14, title:"Zygoma and pterygoid combined",       date:"", tags:["Zygoma","Pterygoid"],        notes:"" },
  { n:15, title:"Photogrammetry verified final",       date:"", tags:["Digital","Photogrammetry"],  notes:"" },
  { n:16, title:"Locator overdenture, mandible",       date:"", tags:["Overdenture"],               notes:"" },
  { n:17, title:"Rescue of misplaced implants",        date:"", tags:["Revision","Rescue"],         notes:"" },
  { n:18, title:"Maxillary reduction, guided plane",   date:"", tags:["Full arch","Guided"],        notes:"" },
  { n:19, title:"Immediate provisional, same visit",   date:"", tags:["Immediate load"],            notes:"" },
  { n:20, title:"Full-mouth rehabilitation",           date:"", tags:["Full mouth"],                notes:"" },
  { n:21, title:"Posterior quadrant restoration",      date:"", tags:["Partial"],                   notes:"" },
  { n:22, title:"Severe atrophy, graftless approach",  date:"", tags:["Graftless","Zygoma"],        notes:"" },
  { n:23, title:"Digital workflow, surgery to final",  date:"", tags:["Digital"],                   notes:"" },
  { n:24, title:"Fractured prosthesis, remake",        date:"", tags:["Revision"],                  notes:"" },
  { n:25, title:"Anterior esthetic full arch",         date:"", tags:["Full arch","Esthetic"],      notes:"" },
  { n:26, title:"Implant-supported removable, resorbed ridge", date:"", tags:["Overdenture"],       notes:"" },
  { n:27, title:"Conversion after failed grafting",    date:"", tags:["Revision","Graftless"],      notes:"" },
  { n:28, title:"CombiGuide full arch",                date:"", tags:["GuidedSMILE"],               notes:"" },
  { n:29, title:"Bilateral sinus approach",            date:"", tags:["Sinus lift"],                notes:"" },
  { n:30, title:"Complex craniofacial rehabilitation", date:"", tags:["Complex"],                   notes:"" }
];

(function(){
  var host=document.getElementById('cases');
  if(!host) return;
  var pad=function(n){ return (n<10?'0':'')+n };
  var KEY='castedo-case-';          // browser-side preview storage
  var MAXW=1400;                     // images are resized before preview/save

  function shot(num,kind,label,pano){
    var file='images/cases/case-'+pad(num)+'-'+kind+'.jpg';
    return '<figure class="shot'+(pano?' pano':'')+(kind.indexOf('after')>-1?' after':'')+'">'+
      '<div class="frame" data-file="'+file+'" data-key="'+pad(num)+'-'+kind+'" tabindex="0" role="button" aria-label="Add '+label+' image for case '+num+'">'+
        '<img src="'+file+'" alt="'+label+', case '+num+'" loading="lazy">'+
        '<div class="ph" hidden><b>'+label+'</b>Drag an image here, or click to choose.<br>Saves as <code>'+file+'</code></div>'+
      '</div><figcaption>'+label+'</figcaption></figure>';
  }

  host.innerHTML = CASES.map(function(c){
    return '<article class="case" id="case-'+pad(c.n)+'">'+
      '<div class="case-head"><span class="case-no">Case '+pad(c.n)+'</span>'+
        '<h2>'+(c.title||'Case '+pad(c.n))+'</h2>'+
        (c.date?'<span class="case-meta">'+c.date+'</span>':'')+
      '</div>'+
      '<div class="case-grid">'+
        shot(c.n,'before','Before')+
        shot(c.n,'after','After')+
        shot(c.n,'pano-before','Pano before',true)+
        shot(c.n,'pano-after','Pano after',true)+
      '</div>'+
      '<div class="case-notes"><h3>Dr. Castedo on this case</h3>'+
        (c.notes ? '<p>'+c.notes.split('\n\n').join('</p><p>')+'</p>'
                 : '<p class="todo">Notes to come. Add them in js/cases.js under case '+pad(c.n)+'.</p>')+
      '</div>'+
      (c.tags && c.tags.length ? '<div class="case-tags"><span>'+c.tags.join('</span><span>')+'</span></div>' : '')+
    '</article>';
  }).join('');

  var input=document.createElement('input');
  input.type='file'; input.accept='image/*'; input.style.display='none';
  document.body.appendChild(input);
  var target=null;

  function show(frame,src){
    var img=frame.querySelector('img'), ph=frame.querySelector('.ph');
    img.style.display=''; img.src=src; ph.hidden=true; frame.classList.add('has-img');
    if(!frame.querySelector('.drop-note')){
      var n=document.createElement('div'); n.className='drop-note';
      n.textContent='Preview only — upload '+frame.dataset.file.split('/').pop()+' to images/cases/';
      frame.appendChild(n);
    }
  }

  function handle(frame,file){
    if(!file || !/^image\//.test(file.type)) return;
    var fr=new FileReader();
    fr.onload=function(){
      var im=new Image();
      im.onload=function(){
        var w=im.width, h=im.height;
        if(w>MAXW){ h=Math.round(h*MAXW/w); w=MAXW }
        var cv=document.createElement('canvas'); cv.width=w; cv.height=h;
        cv.getContext('2d').drawImage(im,0,0,w,h);
        var data=cv.toDataURL('image/jpeg',.86);
        show(frame,data);
        try{ localStorage.setItem(KEY+frame.dataset.key,data) }catch(e){}
        // hand back the correctly named file, ready to upload
        var a=document.createElement('a');
        a.href=data; a.download=frame.dataset.file.split('/').pop();
        document.body.appendChild(a); a.click(); a.remove();
      };
      im.src=fr.result;
    };
    fr.readAsDataURL(file);
  }

  input.addEventListener('change',function(){ if(target) handle(target,input.files[0]); input.value='' });

  [].forEach.call(host.querySelectorAll('.frame'),function(frame){
    var img=frame.querySelector('img'), ph=frame.querySelector('.ph');
    img.addEventListener('error',function(){
      var saved=null; try{ saved=localStorage.getItem(KEY+frame.dataset.key) }catch(e){}
      if(saved){ show(frame,saved); return }
      img.style.display='none'; ph.hidden=false;
    });
    img.addEventListener('load',function(){ frame.classList.add('has-img') });
    frame.addEventListener('click',function(){ target=frame; input.click() });
    frame.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); target=frame; input.click() } });
    ['dragenter','dragover'].forEach(function(t){
      frame.addEventListener(t,function(e){ e.preventDefault(); e.stopPropagation(); frame.classList.add('is-over') });
    });
    ['dragleave','dragend'].forEach(function(t){
      frame.addEventListener(t,function(){ frame.classList.remove('is-over') });
    });
    frame.addEventListener('drop',function(e){
      e.preventDefault(); e.stopPropagation(); frame.classList.remove('is-over');
      handle(frame,e.dataTransfer.files && e.dataTransfer.files[0]);
    });
  });

  // stop the browser opening an image dropped outside a slot
  ['dragover','drop'].forEach(function(t){ window.addEventListener(t,function(e){ e.preventDefault() }) });

  var clear=document.getElementById('clearPreviews');
  if(clear) clear.addEventListener('click',function(){
    try{ Object.keys(localStorage).forEach(function(k){ if(k.indexOf(KEY)===0) localStorage.removeItem(k) }) }catch(e){}
    location.reload();
  });
})();

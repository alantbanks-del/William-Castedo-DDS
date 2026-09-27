/* imagetools.js — PDF-to-image + crop dialog used by the Cases Shared page.
   PDFs are rendered with pdf.js, loaded on demand from cdnjs (needs internet).
   Nothing here uploads anything: everything happens in the browser. */
window.ImageTools = (function(){
  /* pdf.js ships with the site (js/vendor/), with a CDN fallback if those files
     are missing. In the single-file preview both are inlined instead. */
  var LOCAL='js/vendor/pdf.min.js', LOCAL_WORKER='js/vendor/pdf.worker.min.js',
      CDN='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
      CDN_WORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  var pdfReady=null;

  function addScript(src){
    return new Promise(function(res,rej){
      var s=document.createElement('script');
      s.src=src; s.onload=res; s.onerror=function(){ rej(new Error('could not load '+src)) };
      document.head.appendChild(s);
    });
  }

  function setWorker(url){
    // an inlined worker (preview build) wins over any file path
    var inline=document.getElementById('pdf-worker-src');
    if(inline && inline.textContent.length>1000){
      var blob=new Blob([inline.textContent],{type:'text/javascript'});
      window.pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(blob);
    } else {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc=url;
    }
  }

  function loadPdfJs(){
    if(pdfReady) return pdfReady;
    pdfReady=new Promise(function(res,rej){
      if(window.pdfjsLib){ setWorker(LOCAL_WORKER); res(window.pdfjsLib); return }
      addScript(LOCAL)
        .catch(function(){ return addScript(CDN).then(function(){ LOCAL_WORKER=CDN_WORKER }) })
        .then(function(){
          if(!window.pdfjsLib){ throw new Error('pdf.js did not initialise') }
          setWorker(LOCAL_WORKER);
          res(window.pdfjsLib);
        })
        .catch(function(e){ pdfReady=null; rej(e) });
    });
    return pdfReady;
  }

  /* first page of a PDF -> data URL */
  function pdfToImage(file){
    return loadPdfJs().then(function(){
      return file.arrayBuffer ? file.arrayBuffer() : new Response(file).arrayBuffer();
    }).then(function(buf){
      return window.pdfjsLib.getDocument({data:new Uint8Array(buf)}).promise;
    }).then(function(doc){
      return doc.getPage(1);
    }).then(function(page){
      var vp=page.getViewport({scale:1});
      var scale=Math.min(2200/vp.width, 3);          // enough detail for a pano
      vp=page.getViewport({scale:scale});
      var cv=document.createElement('canvas');
      cv.width=Math.round(vp.width); cv.height=Math.round(vp.height);
      var ctx=cv.getContext('2d');
      ctx.fillStyle='#fff'; ctx.fillRect(0,0,cv.width,cv.height);
      return page.render({canvasContext:ctx,viewport:vp}).promise.then(function(){
        return cv.toDataURL('image/jpeg',.92);
      });
    });
  }

  function fileToDataURL(file){
    return new Promise(function(res,rej){
      var fr=new FileReader();
      fr.onload=function(){ res(fr.result) };
      fr.onerror=function(){ rej(new Error('could not read file')) };
      fr.readAsDataURL(file);
    });
  }

  /* any dropped file -> data URL of an image */
  function toImage(file){
    if(!file) return Promise.reject(new Error('no file'));
    if(file.type==='application/pdf' || /\.pdf$/i.test(file.name)) return pdfToImage(file);
    if(/^image\//.test(file.type)) return fileToDataURL(file);
    return Promise.reject(new Error('not an image or PDF'));
  }

  /* ---------------- crop dialog ---------------- */
  function crop(src,aspect,label){
    return new Promise(function(resolve){
      var wrap=document.createElement('div');
      wrap.className='crop-modal';
      wrap.innerHTML=
        '<div class="crop-box" role="dialog" aria-modal="true" aria-label="Crop image">'+
          '<div class="crop-bar"><b>'+(label||'Crop image')+'</b>'+
            '<div class="crop-actions">'+
              '<button type="button" data-a="rot" class="cbtn">Rotate</button>'+
              '<button type="button" data-a="free" class="cbtn" aria-pressed="false">Free crop</button>'+
              '<button type="button" data-a="reset" class="cbtn">Reset</button>'+
            '</div></div>'+
          '<div class="crop-stage"><img alt=""><div class="crop-sel"><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i></div></div>'+
          '<div class="crop-foot"><span class="crop-hint">Drag to move. Pull a corner to resize.</span>'+
            '<div class="crop-actions"><button type="button" data-a="cancel" class="cbtn">Cancel</button>'+
            '<button type="button" data-a="use" class="cbtn primary">Use this crop</button></div></div>'+
        '</div>';
      document.body.appendChild(wrap);
      document.body.style.overflow='hidden';

      var stage=wrap.querySelector('.crop-stage'),
          imgEl=wrap.querySelector('.crop-stage img'),
          sel=wrap.querySelector('.crop-sel'),
          keepAspect=!!aspect, source=new Image(), box={x:0,y:0,w:0,h:0};

      function close(val){
        document.body.style.overflow='';
        wrap.remove();
        resolve(val);
      }

      function fit(){
        var maxW=Math.min(window.innerWidth-64, 980),
            maxH=window.innerHeight-230,
            r=source.width/source.height, w=maxW, h=w/r;
        if(h>maxH){ h=maxH; w=h*r }
        imgEl.width=w; imgEl.height=h;
        stage.style.width=w+'px'; stage.style.height=h+'px';
      }
      function reset(){
        var w=imgEl.width, h=imgEl.height, cw, ch;
        if(keepAspect && aspect){
          cw=w; ch=cw/aspect;
          if(ch>h){ ch=h; cw=ch*aspect }
        } else { cw=w; ch=h }
        box={x:(w-cw)/2, y:(h-ch)/2, w:cw, h:ch};
        draw();
      }
      function draw(){
        sel.style.left=box.x+'px'; sel.style.top=box.y+'px';
        sel.style.width=box.w+'px'; sel.style.height=box.h+'px';
      }
      function clamp(){
        box.w=Math.max(40,Math.min(box.w,imgEl.width));
        box.h=Math.max(40,Math.min(box.h,imgEl.height));
        box.x=Math.max(0,Math.min(box.x,imgEl.width-box.w));
        box.y=Math.max(0,Math.min(box.y,imgEl.height-box.h));
      }

      var drag=null;
      function point(e){ var r=stage.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top} }
      sel.addEventListener('pointerdown',function(e){
        var h=e.target.dataset && e.target.dataset.h;
        drag={mode:h||'move', start:point(e), box:{x:box.x,y:box.y,w:box.w,h:box.h}};
        sel.setPointerCapture(e.pointerId); e.preventDefault();
      });
      sel.addEventListener('pointermove',function(e){
        if(!drag) return;
        var p=point(e), dx=p.x-drag.start.x, dy=p.y-drag.start.y, b=drag.box;
        if(drag.mode==='move'){ box.x=b.x+dx; box.y=b.y+dy }
        else{
          var east=drag.mode.indexOf('e')>-1, south=drag.mode.indexOf('s')>-1;
          var w=east? b.w+dx : b.w-dx, h=south? b.h+dy : b.h-dy;
          if(keepAspect && aspect){ h=w/aspect }
          w=Math.max(40,w); h=Math.max(40,h);
          box.w=w; box.h=h;
          box.x=east? b.x : b.x+(b.w-w);
          box.y=south? b.y : b.y+(b.h-h);
        }
        clamp(); draw();
      });
      ['pointerup','pointercancel'].forEach(function(t){ sel.addEventListener(t,function(){ drag=null }) });

      wrap.addEventListener('click',function(e){
        var a=e.target.dataset && e.target.dataset.a;
        if(!a) return;
        if(a==='cancel'){ close(null) }
        if(a==='reset'){ reset() }
        if(a==='free'){
          keepAspect=!keepAspect;
          e.target.setAttribute('aria-pressed', keepAspect?'false':'true');
          e.target.textContent = keepAspect? 'Free crop' : 'Locked crop';
          reset();
        }
        if(a==='rot'){
          var cv=document.createElement('canvas');
          cv.width=source.height; cv.height=source.width;
          var c=cv.getContext('2d');
          c.translate(cv.width/2,cv.height/2); c.rotate(Math.PI/2);
          c.drawImage(source,-source.width/2,-source.height/2);
          source=new Image();
          source.onload=function(){ imgEl.src=source.src; fit(); reset() };
          source.src=cv.toDataURL('image/jpeg',.92);
        }
        if(a==='use'){
          var scale=source.width/imgEl.width,
              sx=box.x*scale, sy=box.y*scale, sw=box.w*scale, sh=box.h*scale,
              outW=Math.min(Math.round(sw),1600), outH=Math.round(sh*outW/sw);
          var cv=document.createElement('canvas'); cv.width=outW; cv.height=outH;
          cv.getContext('2d').drawImage(source,sx,sy,sw,sh,0,0,outW,outH);
          close(cv.toDataURL('image/jpeg',.86));
        }
      });
      wrap.addEventListener('keydown',function(e){ if(e.key==='Escape') close(null) });

      source.onload=function(){ imgEl.src=source.src; fit(); reset(); wrap.querySelector('[data-a="use"]').focus() };
      source.src=src;
      window.addEventListener('resize',function(){ if(document.body.contains(wrap)){ fit(); reset() } });
    });
  }

  return { toImage:toImage, crop:crop, pdfToImage:pdfToImage };
})();

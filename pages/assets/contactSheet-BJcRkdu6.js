import"./modulepreload-polyfill-Dezn_h7o.js";import{r as e}from"./shaders-W3a51j5u.js";import{t}from"./thumbnails-YApJOV4Y.js";var n=new t(400,225),r=document.getElementById(`grid`);for(let t of e){let e=document.createElement(`figure`);e.innerHTML=`
          <canvas></canvas>
          <figcaption>
            <div>${t.name} ${t.interactive?`<span class="int">✦</span>`:``}</div>
            <div class="cat">${t.category}</div>
          </figcaption>`,r.appendChild(e),n.add(e.querySelector(`canvas`),t)}
import type { Category, ShaderDef } from "../core/types";

type Options = {
  id: string;
  name: string;
  description: string;
  category: Category;
  fragment: string;
  interactive?: boolean;
};

/** Shared controls keep the larger collection predictable and easy to tune. */
function shader(options: Options): ShaderDef {
  return {
    ...options,
    uniforms: {
      u_colorA: { type: "color", value: [0.03, 0.05, 0.12], label: "Base" },
      u_colorB: { type: "color", value: [0.35, 0.18, 0.95], label: "Color" },
      u_accent: { type: "color", value: [0.10, 0.90, 0.78], label: "Accent" },
      u_speed: { type: "float", value: 0.45, min: 0, max: 2, label: "Speed" },
      u_scale: { type: "float", value: 2.2, min: 0.3, max: 8, label: "Scale" },
      u_intensity: { type: "float", value: 1, min: 0, max: 2.5, label: "Intensity" },
    },
  };
}

export const grainGradient = shader({
  id: "grain-gradient", name: "Grain Gradient", category: "gradient",
  description: "Soft drifting colour with tactile animated grain.",
  fragment: `void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 w=vec2(fbm(p*u_scale+t*.12),fbm(p*u_scale+5.0-t*.1));float n=fbm(p*u_scale+w*1.4+t*.08)*.5+.5;vec3 c=mix(u_colorA,u_colorB,smoothstep(.05,.85,n));c=mix(c,u_accent,smoothstep(.58,1.0,n)*.55);c+=grain(uv+fract(t))*.13*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const colorBends = shader({
  id: "color-bends", name: "Color Bends", category: "gradient",
  description: "Broad luminous colour bands folding through space.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float w=fbm(p*u_scale*.6+t*.12);float b=sin((p.x+sin(p.y*1.7+t)*.45+w*.7)*4.0);float k=.5+.5*b;vec3 c=mix(u_colorA,u_colorB,smoothstep(.05,.8,k));c=mix(c,u_accent,pow(smoothstep(.55,1.0,k),2.0));c+=u_accent*pow(max(0.0,b),8.0)*.35*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const ribbonFlow = shader({
  id: "ribbon-flow", name: "Ribbon Flow", category: "gradient",
  description: "Layered twisting ribbons with depth and highlights.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec3 c=u_colorA;for(int i=0;i<6;i++){float f=float(i);float y=sin(p.x*(1.2+f*.17)+t*(.5+f*.08)+f)*(.18+f*.025);y+=snoise(vec2(p.x*.7+f,t*.15))*0.16;float r=exp(-abs(p.y-y-f*.08+.2)*18.0);vec3 rc=mix(u_colorB,u_accent,fract(f*.37));c+=rc*r*(.22+.1*f);}c*=u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const neuroNoise = shader({
  id: "neuro-noise", name: "Neuro Noise", category: "organic",
  description: "Branching neural filaments grown from warped noise.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 q=p*u_scale;float a=fbm(q+vec2(t*.15,0.0));float b=fbm(q*1.7+vec2(-t*.12,4.0));float v=abs(sin((a+b)*12.0));float line=1.0-smoothstep(.04,.18,v);float glow=1.0-smoothstep(.05,.55,v);vec3 c=mix(u_colorA,u_colorB,glow*.35);c+=u_accent*(line+glow*.25)*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const warpTunnel = shader({
  id: "warp-tunnel", name: "Warp Tunnel", category: "space",
  description: "A luminous radial tunnel rushing toward infinity.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p)+.001;float a=atan(p.y,p.x);float n=fbm(vec2(a*1.8,log(r)*u_scale-t));float bands=.5+.5*sin(log(r)*18.0-u_time*3.0+n*5.0);float spokes=.5+.5*sin(a*14.0+n*3.0);float g=pow(bands*spokes,4.0)/(1.0+r*2.0);vec3 c=mix(u_colorA,u_colorB,bands*.35)+u_accent*g*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const spiralField = shader({
  id: "spiral-field", name: "Spiral Field", category: "geometric",
  description: "Hypnotic polar bands curling into a soft centre.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p);float a=atan(p.y,p.x);float s=.5+.5*sin(a*7.0-log(r+.08)*u_scale*5.0-t*3.0+fbm(p*2.0)*2.0);float edge=smoothstep(.35,.65,s);vec3 c=mix(u_colorA,u_colorB,edge);c+=u_accent*pow(s,7.0)*exp(-r*.7)*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const dotOrbit = shader({
  id: "dot-orbit", name: "Dot Orbit", category: "interactive", interactive: true,
  description: "Glowing particles orbit moving cursor-influenced attractors.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 m=mouseSmoothPos();vec3 c=u_colorA;for(int i=0;i<9;i++){float f=float(i);float a=t*(.45+f*.025)+f*TAU/9.0;float r=.22+.055*f;vec2 o=vec2(cos(a),sin(a))*r+sin(f*2.3+t)*.08;o=mix(o,m*.25,u_mouseEnter);float d=length(p-o);float g=.012/(d*d+.004);c+=mix(u_colorB,u_accent,fract(f*.31))*g*.035*u_intensity;}gl_FragColor=vec4(c,1.0);}`,
});

export const smokeRing = shader({
  id: "smoke-ring", name: "Smoke Ring", category: "organic",
  description: "Turbulent expanding rings with a coloured smoky glow.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p);float n=fbm(p*u_scale+vec2(t*.15,-t*.1));float sum=0.0;for(int i=0;i<4;i++){float age=fract(t*.18+float(i)*.25);float ring=exp(-abs(r-(.15+age*1.15)+n*.12)*22.0)*(1.0-age);sum+=ring;}vec3 c=mix(u_colorA,u_colorB,clamp(sum*.45,0.0,1.0));c+=u_accent*sum*.65*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const colorPanels = shader({
  id: "color-panels", name: "Color Panels", category: "gradient",
  description: "Sliding geometric panels with softened colour seams.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float x=p.x+sin(p.y*1.5+t)*.28+fbm(p*.8)*.2;float panel=floor((x*u_scale+t*.25)+3.0);float local=fract(x*u_scale+t*.25);vec3 pc=mix(u_colorB,u_accent,fract(panel*.618));float seam=smoothstep(.02,.18,local)*smoothstep(.02,.18,1.0-local);vec3 c=mix(u_colorA,pc,seam*u_intensity);gl_FragColor=vec4(c,1.0);}`,
});

export const lineWaves = shader({
  id: "line-waves", name: "Line Waves", category: "geometric",
  description: "Layered glowing sine lines flowing with parallax.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec3 c=u_colorA;for(int i=0;i<12;i++){float f=float(i);float y=-.8+f*.14+sin(p.x*u_scale+f*.5+t*(.5+f*.02))*.09;float d=abs(p.y-y);float l=1.0-smoothstep(.008,.025,d);float g=exp(-d*35.0);c+=mix(u_colorB,u_accent,f/11.0)*(l+g*.15)*u_intensity;}gl_FragColor=vec4(c,1.0);}`,
});

export const lightBeams = shader({
  id: "light-beams", name: "Light Beams", category: "space",
  description: "Soft volumetric beams cutting through animated haze.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 source=vec2(sin(t*.3)*.35,1.1);vec2 d=p-source;float a=atan(d.y,d.x);float haze=fbm(p*u_scale+vec2(t*.1,0.0))*.5+.5;float beams=pow(.5+.5*sin(a*18.0+haze*4.0),10.0);float fall=1.0/(1.0+dot(d,d));vec3 c=u_colorA+u_colorB*haze*.14;c+=u_accent*beams*fall*haze*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const magicRings = shader({
  id: "magic-rings", name: "Magic Rings", category: "interactive", interactive: true,
  description: "Nested luminous rings bending around the pointer.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;vec2 m=mouseSmoothPos();p-=m*.28*u_mouseEnter;float t=u_time*u_speed;float r=length(p)+fbm(p*u_scale+t*.08)*.08;float rings=.5+.5*sin(r*32.0-t*4.0);float line=pow(rings,12.0);vec3 c=mix(u_colorA,u_colorB,rings*.22);c+=u_accent*line*exp(-r*.7)*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const networkField = shader({
  id: "network-field", name: "Network Field", category: "geometric",
  description: "A drifting constellation connected by luminous threads.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y*u_scale;vec2 id=floor(p),gv=fract(p)-.5;float t=u_time*u_speed;float glow=0.0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 n=vec2(float(i),float(j));vec2 o=hash22(id+n)-.5;o+=sin(t+hash22(id+n)*TAU)*.18;vec2 q=n+o-gv;float d=length(q);glow+=.015/(d*d+.01);}float links=1.0-smoothstep(.03,.08,abs(gv.x-gv.y+sin(id.x+id.y+t)*.15));vec3 c=u_colorA+u_colorB*glow*.18+pow(max(glow,0.0),1.0/3.0)*u_accent*.02;c+=u_accent*links*.18*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const branchingTrunk = shader({
  id: "branching-trunk", name: "Branching Trunk", category: "organic",
  description: "Electrical tree-like tendrils branching through darkness.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float y=p.y;float x=p.x;float trunk=abs(x-sin(y*u_scale+t)*.08);float b1=abs(x-sin(y*3.0+t)*(.12+.25*smoothstep(-.2,.8,y)));float b2=abs(x+sin(y*3.7-t*.8)*(.1+.3*smoothstep(-.1,.9,y)));float d=min(trunk,min(b1,b2));float g=exp(-d*45.0)*(1.0-smoothstep(.85,1.25,abs(y)));vec3 c=u_colorA+mix(u_colorB,u_accent,smoothstep(-.7,.8,y))*g*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const cloudscape = shader({
  id: "cloudscape", name: "Cloudscape", category: "space",
  description: "Layered illuminated clouds drifting across a deep sky.",
  fragment: `void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float n=fbm(vec3(p*u_scale+vec2(t*.1,0.0),t*.08))*.5+.5;float clouds=smoothstep(.38,.72,n+uv.y*.12);float edge=smoothstep(.3,.65,n)-smoothstep(.62,.9,n);vec3 c=mix(u_colorA,u_colorB,clouds*.8);c+=u_accent*edge*.32*u_intensity;c*=.72+.4*uv.y;gl_FragColor=vec4(c,1.0);}`,
});

export const oceanSurface = shader({
  id: "ocean-surface", name: "Ocean Surface", category: "organic",
  description: "Perspective rolling waves with a bright reflective horizon.",
  fragment: `void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;float t=u_time*u_speed;float horizon=.18;float z=1.0/max(.06,uv.y-horizon);vec2 q=vec2(p.x*z,z)*u_scale*.35;float w=sin(q.x*2.0+t)+sin(q.y*1.3-t*.8)+snoise(q*.7+t*.2);float crest=pow(.5+.5*sin(w*2.0),8.0);float sky=smoothstep(horizon-.02,horizon+.02,uv.y);vec3 sea=mix(u_colorA,u_colorB,.35+.35*w);vec3 c=mix(u_colorA*.5,sea,sky);c+=u_accent*crest*sky*u_intensity/(1.0+z*.06);gl_FragColor=vec4(c,1.0);}`,
});

export const liquidShapeDistortion = shader({
  id: "liquid-shape-distortion", name: "Liquid Shapes", category: "organic",
  description: "Psychedelic liquid forms with bloom and soft shadows.",
  fragment: `void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 w=vec2(fbm(p*u_scale+t*.12),fbm(p*u_scale+4.0-t*.1));float f=fbm(p*u_scale+w*1.8);float shape=smoothstep(-.15,.2,f);float rim=smoothstep(.02,.22,abs(f-.03));vec3 c=mix(u_colorA,u_colorB,shape);c+=u_accent*(1.0-rim)*u_intensity;c+=grain(uv+fract(t))*.04;gl_FragColor=vec4(c,1.0);}`,
});

export const stripeFlow = shader({
  id: "stripe-flow", name: "Stripe Flow", category: "gradient",
  description: "Warped Stripe-style colour bands in constant motion.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float w=fbm(p*u_scale*.7+vec2(t*.12,0.0));float s=.5+.5*sin((p.x+p.y*.25+w*.8)*u_scale*5.0+t);vec3 c=mix(u_colorA,u_colorB,smoothstep(.12,.72,s));c=mix(c,u_accent,smoothstep(.7,1.0,s)*u_intensity);gl_FragColor=vec4(c,1.0);}`,
});

export const conicFlow = shader({
  id: "conic-flow", name: "Conic Flow", category: "gradient",
  description: "Rotating conic colour wedges softened by procedural noise.",
  // The wedge count must be a whole number: `a` wraps 1->0 at the atan branch
  // cut, so a fractional multiplier leaves a hard seam along the -x axis.
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float a=atan(p.y,p.x)/TAU+.5;float n=fbm(p*u_scale+t*.08)*.12;float wd=max(1.0,floor(u_scale));float s=fract(a*wd+n+t*.08);float sm=min(s,1.0-s)*2.0;vec3 c=mix(u_colorA,u_colorB,smoothstep(.05,.85,sm));c=mix(c,u_accent,smoothstep(.55,.95,sm)*u_intensity);c*=1.1-.25*length(p);gl_FragColor=vec4(c,1.0);}`,
});

export const smokeGradient = shader({
  id: "smoke-gradient", name: "Smoke Gradient", category: "gradient",
  description: "A coloured gradient transported through slow smoke.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 q=p*u_scale*.6;vec2 w=vec2(fbm(q+t*.1),fbm(q+6.0-t*.08));float n=fbm(q+w*2.0+t*.05)*.5+.5;float plume=smoothstep(.18,.82,n);vec3 c=mix(u_colorA,u_colorB,plume);c+=u_accent*pow(plume,3.0)*.35*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const radarSweep = shader({
  id: "radar-sweep", name: "Radar Sweep", category: "interactive", interactive: true,
  description: "A scanning radial grid with cursor-positioned echoes.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p),a=atan(p.y,p.x);float circles=1.0-smoothstep(.02,.045,abs(fract(r*u_scale*2.0)-.5));float spokes=1.0-smoothstep(.015,.04,abs(sin(a*6.0)));float sweep=pow(max(0.0,cos(a-t*2.0)),22.0);float echo=exp(-length(p-mousePos())*8.0)*u_mouseEnter;vec3 c=u_colorA+u_colorB*(circles+spokes)*.18;c+=u_accent*(sweep*(1.0-r)+echo)*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const pixelTrail = shader({
  id: "pixel-trail", name: "Pixel Trail", category: "interactive", interactive: true,
  description: "A pixelated glow trail that follows movement and clicks.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;vec2 cell=floor(p*u_scale*18.0)/(u_scale*18.0);float d=length(cell-mousePos());float trail=exp(-d*7.0)*u_mouseEnter;trail+=abs(rippleField(cell,1.0,18.0,1.2));float flick=hash21(cell*31.0+floor(u_time*8.0));float v=smoothstep(.1,.9,trail*(.6+.7*flick));vec3 c=mix(u_colorA,u_colorB,v);c+=u_accent*v*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const antigravityField = shader({
  id: "antigravity-field", name: "Antigravity Field", category: "interactive", interactive: true,
  description: "Floating particles pushed away by the pointer.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y*u_scale;vec2 m=mousePos()*u_scale;vec2 id=floor(p),gv=fract(p)-.5;float t=u_time*u_speed;float stars=0.0;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 n=vec2(float(i),float(j));vec2 o=hash22(id+n)-.5;o+=sin(t+hash22(id+n)*TAU)*.22;vec2 wp=id+n+o;vec2 away=normalize(wp-m+vec2(.001))*exp(-length(wp-m)*.7)*u_mouseEnter;float d=length(n+o+away*.65-gv);stars+=.012/(d*d+.008);}vec3 c=u_colorA+mix(u_colorB,u_accent,clamp(stars*.08,0.0,1.0))*stars*.08*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const metallicPaint = shader({
  id: "metallic-paint", name: "Metallic Paint", category: "iridescent",
  description: "Flowing chrome bands with glossy coloured reflections.",
  fragment: `float metalH(vec2 p,float t){return fbm(p*u_scale+vec2(t*.12,-t*.08));}void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float e=.012;float h=metalH(p,t);vec2 g=vec2(metalH(p+vec2(e,0),t)-h,metalH(p+vec2(0,e),t)-h)/e;vec3 n=normalize(vec3(-g*.35,1.0));float ref=.5+.5*n.x;float spec=pow(max(0.0,dot(n,normalize(vec3(.4,.6,1.0)))),28.0);vec3 c=mix(u_colorA,u_colorB,ref);c=mix(c,u_accent,.5+.5*sin(h*8.0+t));c+=spec*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const shiftingSands = shader({
  id: "shifting-sands", name: "Shifting Sands", category: "organic",
  description: "Wind-sculpted dune ridges with travelling highlights.",
  fragment: `float dune(vec2 p,float t){float n=fbm(p*u_scale+vec2(t*.08,0.0));return 1.0-abs(n);}void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float e=.012;float h=dune(p,t);vec2 g=vec2(dune(p+vec2(e,0),t)-h,dune(p+vec2(0,e),t)-h)/e;vec3 n=normalize(vec3(-g*.22,1.0));float light=clamp(dot(n,normalize(vec3(-.5,.5,1.0))),0.0,1.0);vec3 c=mix(u_colorA,u_colorB,h*.7);c+=u_accent*pow(light,3.0)*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const cosmicVortex = shader({
  id: "cosmic-vortex", name: "Cosmic Vortex", category: "interactive", interactive: true,
  description: "Spiralling energy around a cursor-controlled centre.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;vec2 centre=mouseSmoothPos()*.45*u_mouseEnter;p-=centre;float t=u_time*u_speed;float r=length(p)+.01,a=atan(p.y,p.x);float n=fbm(vec2(a*2.0,r*u_scale*3.0-t));float arms=.5+.5*sin(a*7.0-r*12.0+t*2.0+n*4.0);float glow=pow(arms,6.0)*exp(-r*.9)+.025/r;vec3 c=mix(u_colorA,u_colorB,arms*.25);c+=u_accent*glow*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const smokeInk = shader({
  id: "smoke-ink", name: "Smoke Ink", category: "organic",
  description: "Dense ink tendrils curling through coloured haze.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 q=p*u_scale;vec2 w=vec2(fbm(q+t*.08),fbm(q+9.0-t*.06));float n=fbm(q+w*2.3);float ink=smoothstep(-.3,.45,n);float vein=pow(1.0-abs(sin(n*9.0)),5.0);vec3 c=mix(u_colorA,u_colorB,ink*.75);c+=u_accent*vein*ink*.55*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const moireInterference = shader({
  id: "moire-interference", name: "Moiré Interference", category: "geometric",
  description: "Overlapping line fields producing shifting interference.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float a=sin(length(p-vec2(sin(t)*.2,0.0))*u_scale*30.0);float b=sin(length(p+vec2(cos(t*.8)*.25,0.0))*u_scale*30.5);float m=.5+.5*a*b;float lines=pow(m,5.0);vec3 c=mix(u_colorA,u_colorB,m*.45);c+=u_accent*lines*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const reactionDiffusion = shader({
  id: "reaction-diffusion", name: "Reaction Diffusion", category: "organic",
  description: "Evolving coral and zebra-like cellular bands.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;vec2 q=p*u_scale;float n=fbm(q+t*.05);float cells=sin(q.x*3.0+n*8.0)+sin(q.y*3.2-n*7.0)+snoise(vec3(q*1.8,t*.15))*1.5;float band=1.0-smoothstep(.12,.5,abs(sin(cells*1.6)));vec3 c=mix(u_colorA,u_colorB,smoothstep(-1.0,1.0,cells)*.65);c+=u_accent*band*u_intensity;gl_FragColor=vec4(c,1.0);}`,
});

export const kaleidoscope = shader({
  id: "kaleidoscope", name: "Kaleidoscope", category: "geometric",
  description: "Mirrored procedural colour with crystalline symmetry.",
  fragment: `void main(){vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/u_resolution.y;float t=u_time*u_speed;float r=length(p),a=atan(p.y,p.x);float seg=TAU/8.0;a=abs(mod(a+t*.08,seg)-seg*.5);vec2 q=vec2(cos(a),sin(a))*r*u_scale;float n=fbm(q+vec2(t*.12,-t*.1))*.5+.5;float facets=.5+.5*sin(n*12.0+r*15.0);vec3 c=mix(u_colorA,u_colorB,n);c=mix(c,u_accent,pow(facets,4.0)*u_intensity);gl_FragColor=vec4(c,1.0);}`,
});

export const scoutedGradientShaders = [
  grainGradient, colorBends, ribbonFlow, colorPanels, stripeFlow, conicFlow, smokeGradient,
];
export const scoutedOrganicShaders = [
  neuroNoise, smokeRing, branchingTrunk, oceanSurface, liquidShapeDistortion,
  shiftingSands, smokeInk, reactionDiffusion,
];
export const scoutedInteractiveShaders = [
  dotOrbit, magicRings, radarSweep, pixelTrail, antigravityField, cosmicVortex,
];
export const scoutedSpaceShaders = [warpTunnel, lightBeams, cloudscape];
export const scoutedGeometricShaders = [
  spiralField, lineWaves, networkField, moireInterference, kaleidoscope,
];
export const scoutedIridescentShaders = [metallicPaint];
export const scoutedShaders = [
  ...scoutedGradientShaders, ...scoutedIridescentShaders, ...scoutedInteractiveShaders,
  ...scoutedOrganicShaders, ...scoutedSpaceShaders, ...scoutedGeometricShaders,
];

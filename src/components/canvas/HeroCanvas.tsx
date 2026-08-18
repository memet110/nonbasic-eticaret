"use client";

import { useEffect, useRef } from "react";

const vertSrc = `
  attribute vec2 aPos;
  varying vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const fragSrc = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uImgSize;
  uniform float uHover;

  vec2 coverUv(vec2 uv) {
    float screenAspect = uResolution.x / uResolution.y;
    float imgAspect = uImgSize.x / uImgSize.y;
    vec2 scale = vec2(1.0);
    if (screenAspect > imgAspect) {
      scale.y = imgAspect / screenAspect;
    } else {
      scale.x = screenAspect / imgAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  vec2 curl(vec2 p) {
    float e = 0.06;
    float n1 = snoise(p + vec2(0.0, e));
    float n2 = snoise(p - vec2(0.0, e));
    float n3 = snoise(p + vec2(e, 0.0));
    float n4 = snoise(p - vec2(e, 0.0));
    float dx = (n1 - n2) / (2.0 * e);
    float dy = (n3 - n4) / (2.0 * e);
    return vec2(dy, -dx);
  }

  void main() {
    vec2 uv = coverUv(vUv);
    vec2 diff = uv - uMouse;
    diff.x *= uResolution.x / uResolution.y;
    float dist = length(diff);

    float radius = 0.4;
    float falloff = smoothstep(radius, 0.0, dist) * uHover;

    vec2 flow = vec2(0.0);
    vec2 p = vec2(uv.x * 10.0, uv.y * 10.0 * 1.6) ;
    float amp = 1.0;
    float freq = 1.0;
    for (int i = 0; i < 3; i++) {
      vec2 sample = p * freq + vec2(uTime * 0.06, -uTime * 0.04) * float(i + 1);
      flow += curl(sample) * amp;
      freq *= 2.1;
      amp *= 0.5;
    }

    float strength = mix(0.0028, 0.014, falloff);
    vec2 warped = uv + flow * strength;

    vec3 color = texture2D(uImage, warped).rgb;

    float vignette = smoothstep(0.9, 0.3, length(vUv - 0.5));
    color *= mix(0.75, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }

    function compile(type: number, src: string) {
      const sh = gl!.createShader(type);
      if (!sh) return null;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
        const info = gl!.getShaderInfoLog(sh);
        console.error("Shader compile error:", info, "Source:", src);
        throw new Error("Shader compile error: " + info);
      }
      return sh;
    }

    const vShader = compile(gl.VERTEX_SHADER, vertSrc);
    const fShader = compile(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram();
    if (!prog || !vShader || !fShader) return;

    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uResolution = gl.getUniformLocation(prog, "uResolution");
    const uImgSize = gl.getUniformLocation(prog, "uImgSize");
    const uHover = gl.getUniformLocation(prog, "uHover");

    let targetMouse = [0.5, 0.5];
    let mouse = [0.5, 0.5];
    let targetHover = 0;
    let hoverAmt = 0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resize);
    resize();

    function setPointer(clientX: number, clientY: number) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      targetMouse = [
        (clientX - rect.left) / rect.width,
        1.0 - (clientY - rect.top) / rect.height,
      ];
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPointer(e.clientX, e.clientY);
      targetHover = 1;
      if (dotRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        dotRef.current.style.left = (e.clientX - rect.left) + "px";
        dotRef.current.style.top = (e.clientY - rect.top) + "px";
      }
    };
    const handleMouseLeave = () => {
      targetHover = 0;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        setPointer(t.clientX, t.clientY);
        targetHover = 1;
        if (dotRef.current && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          dotRef.current.style.left = (t.clientX - rect.left) + "px";
          dotRef.current.style.top = (t.clientY - rect.top) + "px";
        }
      }
    };
    const handleTouchEnd = () => {
      targetHover = 0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    const texture = gl.createTexture();
    let imgW = 1,
      imgH = 1;
    let reqId: number;

    const img = new Image();
    img.onload = () => {
      imgW = img.width;
      imgH = img.height;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const start = performance.now();
      function render(now: number) {
        const t = (now - start) / 1000;
        mouse[0] += (targetMouse[0] - mouse[0]) * 0.06;
        mouse[1] += (targetMouse[1] - mouse[1]) * 0.06;
        hoverAmt += (targetHover - hoverAmt) * 0.08;

        gl!.uniform2f(uMouse, mouse[0], mouse[1]);
        gl!.uniform1f(uTime, t);
        gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
        gl!.uniform2f(uImgSize, imgW, imgH);
        gl!.uniform1f(uHover, hoverAmt);

        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        reqId = requestAnimationFrame(render);
      }
      reqId = requestAnimationFrame(render);
    };
    img.src = "/images/starry-night.jpg";

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (reqId) cancelAnimationFrame(reqId);

      gl.deleteTexture(texture);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      if (vShader) gl.deleteShader(vShader);
      if (fShader) gl.deleteShader(fShader);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-none"
        style={{ pointerEvents: "auto", display: "block" }}
      />
      <div
        ref={dotRef}
        className="absolute w-2.5 h-2.5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-[width,height] duration-200 z-50"
        style={{ backgroundColor: "rgba(244,239,224,0.9)", left: "-100px", top: "-100px" }}
      />
    </>
  );
}

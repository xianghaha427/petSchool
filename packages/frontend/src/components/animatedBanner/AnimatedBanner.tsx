import { useEffect, useRef, useState } from 'react';
import bezier from './cubicBezier';
import position, { Layer } from './position';

const imgList: Record<string, string> = {
  '01': '/images/bannerImage/01.png',
  '02': '/images/bannerImage/02.png',
  '03': '/images/bannerImage/03.png',
  '04': '/images/bannerImage/04.png',
  '05': '/images/bannerImage/05.png',
  '06': '/images/bannerImage/06.png',
  '07': '/images/bannerImage/07.png',
  '08': '/images/bannerImage/08.png',
  '09': '/images/bannerImage/09.png',
  '10': '/images/bannerImage/10.png',
  '11': '/images/bannerImage/11.png',
  '12': '/images/bannerImage/12.png',
  '13': '/images/bannerImage/13.png',
  '14': '/images/bannerImage/14.png',
  '15': '/images/bannerImage/15.png',
};

interface AnimatedBannerProps {
  staticFallback?: string;
}

export function AnimatedBanner({ staticFallback = '/images/bannerImage/static.png' }: AnimatedBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [bannerSupported, setBannerSupported] = useState(true);
  const [showStaticFallback, setShowStaticFallback] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkSupport =
      typeof CSS !== 'undefined' &&
      CSS.supports('filter: blur(1px)') &&
      !/^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (!checkSupport) {
      setBannerSupported(false);
      return;
    }

    const layerConfig = JSON.parse(JSON.stringify(position.layers)) as Layer[];
    const layerElements: HTMLDivElement[] = [];
    let containerHeight = container.clientHeight;
    let containerWidth = container.clientWidth;
    const containerScale = containerHeight / 155;

    let displace = 0;
    let enterX = 0;
    let raf = 0;
    let lastDisplace = NaN;
    let entered = false;

    const curveParameterToFunc = (param: number[]) => {
      const o = bezier(...param);
      return (v: number) => (v > 0 ? o(v) : -o(-v));
    };

    const af = () => {
      if (lastDisplace === displace) return;
      lastDisplace = displace;

      layerElements.forEach((layer, i) => {
        const v = layerConfig[i];
        const a = v.resources[0].el;
        if (!a) return;

        const transform = {
          scale: v._initState?.scale ?? 1,
          rotate: v._initState?.rotate ?? 0,
          translate: v._initState?.translate ?? [0, 0],
        };

        if (v.scale?.offset !== undefined) {
          const x = v.scale.offset || 0;
          const itp = v.scale.offsetCurve
            ? curveParameterToFunc(v.scale.offsetCurve)
            : (x: number) => x;
          const offset = x * itp(displace);
          transform.scale = (v._initState?.scale ?? 1) + offset;
        }

        if (v.rotate?.offset !== undefined) {
          const offset = v.rotate.offset * displace;
          transform.rotate = (v._initState?.rotate ?? 0) + offset;
        }

        if (v.translate?.offset !== undefined) {
          const x = v.translate.offset;
          const offset = x.map((v) => displace * v);
          const translate = v._initState?.translate.map(
            (x, i) => (x + offset[i]) * containerScale * (v.scale?.initial || 1)
          );
          transform.translate = translate ?? [0, 0];
        }

        a.style.transform =
          `scale(${transform.scale})` +
          `translate(${transform.translate[0]}px, ${transform.translate[1]}px)` +
          `rotate(${transform.rotate}deg)`;

        if (v.blur) {
          const x = v.blur.offset || 0;
          const blurOffset = x * displace;
          let res = 0;
          if (!v.blur.wrap || v.blur.wrap === 'clamp') {
            res = Math.max(0, (v._initState?.blur ?? 0) + blurOffset);
          } else if (v.blur.wrap === 'alternate') {
            res = Math.abs((v._initState?.blur ?? 0) + blurOffset);
          }
          a.style.filter = res < 1e-4 ? '' : `blur(${res}px)`;
        }

        if (v.opacity) {
          const x = v.opacity.offset || 0;
          const opacityOffset = x * displace;
          const initial = v._initState?.opacity ?? 1;
          if (!v.opacity.wrap || v.opacity.wrap === 'clamp') {
            a.style.opacity = String(Math.max(0, Math.min(1, initial + opacityOffset)));
          } else if (v.opacity.wrap === 'alternate') {
            const x = initial + opacityOffset;
            let y = Math.abs(x % 1);
            if (Math.abs(x % 2) >= 1) {
              y = 1 - y;
            }
            a.style.opacity = String(y);
          }
        }
      });
    };

    const handleLeave = () => {
      const now = performance.now();
      const timeout = 200;
      const tempDisplace = displace;
      cancelAnimationFrame(raf);

      const leaveAF = (t: number) => {
        if (t - now < timeout) {
          displace = tempDisplace * (1 - (t - now) / 200);
          af();
          raf = requestAnimationFrame(leaveAF);
        } else {
          displace = 0;
          af();
        }
      };
      raf = requestAnimationFrame(leaveAF);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const offsetY = document.documentElement.scrollTop + e.clientY;
      if (offsetY < containerHeight) {
        if (!entered) {
          entered = true;
          enterX = e.clientX;
        }
        displace = (e.clientX - enterX) / containerWidth;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(af);
      } else {
        if (entered) {
          entered = false;
          handleLeave();
        }
      }
    };

    const handleMouseLeave = () => {
      entered = false;
      handleLeave();
    };

    const handleResize = () => {
      containerHeight = container.clientHeight;
      containerWidth = container.clientWidth;
      const scale = containerHeight / 155;
      layerConfig.forEach((lc) => {
        lc.resources.forEach((i) => {
          const el = i.el;
          if (!el) return;
          const initial = lc.scale?.initial || 1;
          el.height = Number(el.dataset?.height) * scale * initial;
          el.width = Number(el.dataset?.width) * scale * initial;
        });
      });
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(af);
    };

    const init = async () => {
      layerConfig.forEach((v) => {
        v._initState = {
          scale: v.scale?.initial === undefined ? 1 : v.scale.initial,
          rotate: v.rotate?.initial || 0,
          translate: v.translate?.initial || [0, 0],
          blur: v.blur?.initial || 0,
          opacity: v.opacity?.initial === undefined ? 1 : v.opacity.initial,
        };

        v.resources.forEach((r, idx) => {
          const img = document.createElement('img');
          img.src = imgList[r.src] || '';
          r.el = img;
          r.dataset = { height: '', width: '' };
        });
      });

      try {
        await Promise.all(
          layerConfig.map(
            (v) =>
              new Promise<void>((resolve) => {
                const img = v.resources[0].el;
                if (img) {
                  img.onload = () => {
                    if (img.dataset) {
                      img.dataset.height = String(img.naturalHeight);
                      img.dataset.width = String(img.naturalWidth);
                    }
                    const initial = v.scale?.initial === undefined ? 1 : v.scale?.initial;
                    img.height = Number(img.dataset?.height) * containerScale * initial;
                    img.width = Number(img.dataset?.width) * containerScale * initial;
                    resolve();
                  };
                  img.onerror = (e) => {
                    console.error('Failed to load image:', imgList[r.src], e);
                    resolve();
                  };
                } else {
                  resolve();
                }
              })
          )
        );
      } catch (e) {
        console.error('Load animated banner images error', e);
        return;
      }

      const layers = layerConfig.map((v) => {
        const layer = document.createElement('div');
        layer.classList.add('layer');
        container.appendChild(layer);
        return layer;
      });

      layerConfig.forEach((v, i) => {
        const a = v.resources[0].el;
        if (a) {
          layers[i].appendChild(a);
        }
      });

      layerElements.push(...layers);
      setBannerLoaded(true);
      setShowStaticFallback(false);
      requestAnimationFrame(af);

      document.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('resize', handleResize);
    };

    if (document.readyState !== 'complete') {
      window.addEventListener('load', init);
    } else {
      init();
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!bannerSupported) {
    return (
      <div
        className="w-full h-[155px] bg-cover bg-center"
        style={{ backgroundImage: `url(${staticFallback})` }}
      />
    );
  }

  return (
    <>
      <style>{`
        .animated-banner {
          position: relative;
          overflow: hidden;
          background-color: #f9f9f9;
        }
        .animated-banner > .layer {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .animated-banner > .layer img {
          position: absolute;
          max-width: none;
          transform-origin: center center;
        }
      `}</style>
      <div
        ref={containerRef}
        className="animated-banner"
        style={{
          height: '300px',
          width: '100%',
          backgroundImage: showStaticFallback ? `url(${staticFallback})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </>
  );
}

export default AnimatedBanner;

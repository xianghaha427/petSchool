export interface LayerResource {
  src: string;
  id: number;
  el?: HTMLImageElement;
  dataset?: { height: string; width: string };
}

export interface Layer {
  resources: LayerResource[];
  scale?: {
    initial?: number;
    offset?: number;
    offsetCurve?: number[];
  };
  rotate?: {
    initial?: number;
    offset?: number;
  };
  translate?: {
    initial?: number[];
    offset?: number[];
  };
  blur?: {
    initial?: number;
    offset?: number;
  };
  opacity?: {
    initial?: number;
    offset?: number;
    wrap?: string;
    offsetCurve?: number[];
  };
  id: number;
  name?: string;
  _initState?: {
    scale: number;
    rotate: number;
    translate: number[];
    blur: number;
    opacity: number;
  };
}

export interface BannerConfig {
  version: string;
  layers: Layer[];
  extensions?: {
    petals?: object;
  };
}

const position: BannerConfig = {
  version: '1',
  layers: [
    {
      resources: [{ src: '01', id: 0 }],
      scale: { initial: 0.5 },
      translate: { initial: [0, -30], offset: [-200, 0] },
      id: 16,
      name: '15_天空',
    },
    {
      resources: [{ src: '02', id: 0 }],
      scale: { initial: 0.5 },
      translate: { initial: [2200, 0], offset: [-200, 0] },
      id: 15,
      name: '14_远景亭子',
    },
    {
      resources: [{ src: '03', id: 0 }],
      scale: { initial: 0.45 },
      translate: { initial: [1500, 0], offset: [-300, 0] },
      id: 17,
      name: '13_右侧船坞',
    },
    {
      resources: [{ src: '04', id: 0 }],
      scale: { initial: 0.49 },
      translate: { initial: [-1300, 0], offset: [-900, 0] },
      id: 14,
      name: '12_远景桥',
    },
    {
      resources: [{ src: '05', id: 0 }],
      scale: { initial: 0.45 },
      translate: { initial: [1350, 100], offset: [-250, 0] },
      id: 23,
      name: '11_近船',
    },
    {
      resources: [{ src: '06', id: 0 }],
      scale: { initial: 0.28 },
      translate: { initial: [900, 130], offset: [-200, 0] },
      opacity: { initial: 0, offset: 2, offsetCurve: [0.4065, 0.5925, 1, 1] },
      id: 18,
      name: '10_2233坐船',
    },
    {
      resources: [{ src: '07', id: 0 }],
      scale: { initial: 0.7 },
      translate: { initial: [160, 20], offset: [-1000, 0] },
      id: 24,
      name: '09_右侧远处草坪',
    },
    {
      resources: [{ src: '08', id: 0 }],
      scale: { initial: 0.7 },
      translate: { initial: [-500, 70], offset: [-1200, 0] },
      id: 13,
      name: '08_远草坪',
    },
    {
      resources: [{ src: '09', id: 0 }],
      scale: { initial: 0.4 },
      translate: { initial: [-600, 40], offset: [-1000, 0] },
      opacity: { initial: 0, offset: -2 },
      id: 20,
      name: '07_22放风筝',
    },
    {
      resources: [{ src: '10', id: 0 }],
      scale: { initial: 0.4 },
      translate: { initial: [-850, 80], offset: [-1450, 0] },
      opacity: { initial: 0, offset: -2 },
      id: 21,
      name: '06_33放风筝',
    },
    {
      resources: [{ src: '11', id: 0 }],
      scale: { initial: 0.45 },
      translate: { initial: [-200, 30], offset: [-2500, 0] },
      id: 10,
      name: '05_樱花远景',
    },
    {
      resources: [{ src: '12', id: 0 }],
      scale: { initial: 0.5 },
      translate: { initial: [200, 0], offset: [-3000, 0] },
      id: 11,
      name: '04_樱花草坪',
    },
    {
      resources: [{ src: '13', id: 0 }],
      scale: { initial: 0.45 },
      translate: { initial: [480, 30], offset: [-3300, 0] },
      opacity: {
        offset: 1.2,
        wrap: 'alternate',
        offsetCurve: [0.093, -0.2709999999999999, 1, 1],
      },
      id: 7,
      name: '03_2233野餐',
    },
    {
      resources: [{ src: '14', id: 0 }],
      scale: { initial: 0.6 },
      translate: { initial: [3500, 0], offset: [-3500, 0] },
      blur: { initial: 2 },
      id: 19,
      name: '02_柳树近景',
    },
    {
      resources: [{ src: '15', id: 0 }],
      scale: { initial: 0.5 },
      translate: { initial: [-2000, 0], offset: [-6000, 0] },
      blur: { initial: 1 },
      id: 12,
      name: '01_樱花近景',
    },
  ],
  extensions: {
    petals: {},
  },
};

export default position;

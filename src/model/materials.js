import * as THREE from 'three';

/** Deliberately texture-free PBR materials: all mosaics and tiles are geometry. */
export function createMaterials() {
  const make = (name, color, metalness = 0, roughness = 0.7) => {
    const m = new THREE.MeshStandardMaterial({ color, metalness, roughness });
    m.name = name;
    return m;
  };
  return {
    gold: make('Gilded ornament', '#d9a640', .72, .29),
    goldLight: make('Polished gold highlights', '#f5d788', .65, .25),
    goldDark: make('Antique gold recess', '#906325', .6, .42),
    vermilion: make('Terracotta roof', '#b8492b', .12, .68),
    redLight: make('Terracotta tile highlights', '#d65d35', .1, .7),
    redDark: make('Terracotta tile shadows', '#97351f', .12, .72),
    green: make('Emerald ceramic roof', '#164f42', .25, .36),
    greenLight: make('Jade ceramic', '#28755c', .25, .32),
    blue: make('Indigo glass mosaic', '#172f52', .3, .28),
    turquoise: make('Turquoise mosaic', '#4d9390', .3, .3),
    ivory: make('Ivory stucco', '#eee7d5', 0, .87),
    white: make('Porcelain', '#fcf5e5', .08, .57),
    stone: make('Warm limestone', '#b3ad99', 0, .94),
    darkStone: make('Limestone seams', '#8c9185', 0, .94),
    wood: make('Teak and lacquer', '#492821', .1, .67),
    black: make('Shadowed openings', '#14282a', .05, .9),
    jade: make('Emerald Buddha jade', '#19745b', .3, .23),
    leaf: make('Tree foliage', '#365849', 0, .92),
    leafLight: make('Tree tips', '#527353', 0, .9),
    lawn: make('Garden lawn', '#627b55', 0, 1),
    trunk: make('Tree bark', '#62513e', 0, 1),
    road: make('Surrounding streets', '#606b68', 0, 1),
    plinth: make('Exhibition plinth', '#d7d0bc', .05, .8),
    flagRed: make('Thai flag red', '#ab2535', 0, .8),
    flagBlue: make('Thai flag blue', '#252b4e', 0, .8),
  };
}

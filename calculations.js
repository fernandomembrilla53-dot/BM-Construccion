/* BM Construcción · núcleo de cálculos 3.0
 * Funciones puras, sin dependencias ni acceso a datos personales.
 * Todas las cantidades son orientativas; no constituyen cálculo estructural.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.BMCalc = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var BRICKS = Object.freeze({
    hueco8:   { label: "Hueco 8 × 18 × 33 cm", units: 15, weight: 3.3, pallet: 216, mortar: 13 },
    hueco12:  { label: "Hueco 12 × 18 × 33 cm", units: 15, weight: 4.5, pallet: 144, mortar: 17 },
    hueco18:  { label: "Hueco 18 × 18 × 33 cm", units: 15, weight: 6.0, pallet: 90, mortar: 23 },
    comun:    { label: "Ladrillo macizo común (orientativo)", units: 60, weight: 3.0, pallet: 0, mortar: 60 },
    bloque20: { label: "Bloque de hormigón 20 × 20 × 40 cm (orientativo)", units: 12.5, weight: 14, pallet: 0, mortar: 20 }
  });
  var DENSITIES = Object.freeze({
    concreto: { label: "Hormigón simple", density: 2400, note: "Valor aproximado para estimación, no para proyecto estructural." },
    armado:   { label: "Hormigón armado", density: 2500, note: "Aproximado según carga permanente de referencia." },
    arena:    { label: "Arena seca suelta", density: 1555, note: "La humedad y compactación alteran mucho el peso." },
    grava:    { label: "Piedra/grava seca suelta", density: 1680, note: "Variable según granulometría y humedad." },
    mortero:  { label: "Mortero cemento-cal-arena", density: 1900, note: "Masa volumétrica de referencia del material." },
    ladrillo: { label: "Mampostería de ladrillo macizo", density: 1700, note: "Estimación por volumen del muro." },
    acero:    { label: "Acero", density: 7850, note: "Acero estándar." },
    aluminio: { label: "Aluminio", density: 2700, note: "Aluminio estándar." },
    madera:   { label: "Madera blanda", density: 600, note: "Depende de especie y humedad." }
  });
  function num(value, name, allowZero) {
    if (value === null || typeof value === "undefined" || String(value).trim() === "") throw Error("Completá " + name + ".");
    var text = String(value).trim().replace(",", ".");
    if (!/^\d+(?:\.\d+)?$/.test(text)) throw Error("Revisá " + name + ": usá un número positivo.");
    var n = Number(text);
    if (!Number.isFinite(n) || (allowZero ? n < 0 : n <= 0) || n > 1e10)
      throw Error("Revisá " + name + ": el valor está fuera de rango.");
    return n;
  }
  function pct(value, label) {
    var p = num(value, label || "el porcentaje", true);
    if (p > 100) throw Error("El porcentaje no puede superar el 100 %.");
    return p / 100;
  }
  function roundUp(value) { return Math.ceil(value - 1e-10); }
  function brickWall(o) {
    if (!o || !Array.isArray(o.lengths) || !o.lengths.length || o.lengths.length > 100)
      throw Error("Agregá al menos una pared válida.");
    var lengths = o.lengths.map(function (x) { return num(x, "largo de pared"); });
    var height = num(o.height, "alto de paredes"), openings = num(o.openings, "aberturas", true);
    var waste = pct(o.waste, "desperdicio"), brick = BRICKS[o.brick];
    if (!brick) throw Error("Elegí un ladrillo válido.");
    var gross = lengths.reduce(function (sum, x) { return sum + x; }, 0) * height;
    if (openings >= gross) throw Error("Las aberturas deben ser menores que la superficie de los muros.");
    var net = gross - openings, units = roundUp(net * brick.units * (1 + waste));
    var mortarKg = net * brick.mortar * (1 + waste);
    var bagKg = num(o.bagKg || 30, "peso de la bolsa");
    return { totalLength: gross / height, grossArea: gross, netArea: net, units: units,
      pallets: brick.pallet ? roundUp(units / brick.pallet) : null,
      brickWeightKg: units * brick.weight, mortarKg: mortarKg,
      mortarBags: roundUp(mortarKg / bagKg), brick: brick, wastePct: waste * 100 };
  }
  function concrete(o) {
    var length = num(o.length, "largo"), width = num(o.width, "ancho");
    var thickness = num(o.thickness, "espesor"), waste = pct(o.waste, "margen");
    var density = num(o.density || 2400, "densidad");
    var net = length * width * thickness / 100, total = net * (1 + waste);
    return { area: length * width, netM3: net, totalM3: total,
      totalLiters: total * 1000, weightKg: total * density };
  }
  function floor(o) {
    var length = num(o.length, "largo"), width = num(o.width, "ancho");
    var openings = num(o.openings || 0, "superficie descontada", true);
    var waste = pct(o.waste, "desperdicio"), boxArea = num(o.boxArea, "cobertura por caja");
    var tileW = num(o.tileWidth, "ancho de baldosa"), tileL = num(o.tileLength, "largo de baldosa");
    var glueRate = num(o.glueRate, "consumo de adhesivo");
    var bagKg = num(o.bagKg, "peso de bolsa");
    var net = length * width - openings;
    if (net <= 0) throw Error("La superficie descontada supera el piso.");
    var purchase = net * (1 + waste);
    return { netArea: net, purchaseArea: purchase, boxes: roundUp(purchase / boxArea),
      tiles: roundUp(purchase / (tileW * tileL / 10000)),
      adhesiveKg: purchase * glueRate, adhesiveBags: roundUp(purchase * glueRate / bagKg) };
  }
  function paint(o) {
    var area = num(o.area, "superficie"), openings = num(o.openings || 0, "superficie sin pintar", true);
    var coverage = num(o.coverage, "rendimiento"), coats = num(o.coats, "cantidad de manos");
    var waste = pct(o.waste, "margen");
    if (!Number.isInteger(coats) || coats > 10) throw Error("Las manos deben ser un entero entre 1 y 10.");
    if (openings >= area) throw Error("La superficie sin pintar debe ser menor que el total.");
    var net = area - openings, liters = net * coats / coverage * (1 + waste);
    return { netArea: net, coats: coats, liters: liters, buckets20: roundUp(liters / 20),
      cans4: roundUp(liters / 4) };
  }
  function plaster(o) {
    var area = num(o.area, "superficie"), openings = num(o.openings || 0, "aberturas", true);
    var thickness = num(o.thickness, "espesor"), waste = pct(o.waste, "margen");
    var density = num(o.density || 1900, "densidad");
    if (openings >= area) throw Error("Las aberturas superan la superficie.");
    var net = area - openings, volume = net * thickness / 1000 * (1 + waste);
    return { netArea: net, volumeM3: volume, freshKg: volume * density };
  }
  function screed(o) {
    var area = num(o.area, "superficie"), thickness = num(o.thickness, "espesor");
    var waste = pct(o.waste, "margen"), density = num(o.density || 1900, "densidad");
    var volume = area * thickness / 100 * (1 + waste);
    return { netM3: area * thickness / 100, totalM3: volume, totalLiters: volume * 1000, weightKg: volume * density };
  }
  function excavation(o) {
    var length = num(o.length, "largo"), width = num(o.width, "ancho");
    var depth = num(o.depth, "profundidad"), swell = pct(o.swell, "esponjamiento");
    var truck = num(o.truck, "capacidad del transporte");
    var density = num(o.density || 1600, "densidad");
    var net = length * width * depth, loose = net * (1 + swell);
    return { bankM3: net, looseM3: loose, trucks: roundUp(loose / truck), estimatedKg: net * density };
  }
  function roof(o) {
    var length = num(o.length, "largo horizontal"), width = num(o.width, "ancho horizontal");
    var angle = num(o.angle, "pendiente", true), sheetArea = num(o.sheetArea, "área útil por chapa");
    var waste = pct(o.waste, "margen");
    if (angle >= 75) throw Error("Usá una inclinación menor a 75°.");
    var projected = length * width, sloped = projected / Math.cos(angle * Math.PI / 180);
    return { projectedM2: projected, roofM2: sloped, purchaseArea: sloped * (1 + waste),
      sheets: roundUp(sloped * (1 + waste) / sheetArea) };
  }
  function steel(o) {
    var diameter = num(o.diameter, "diámetro"), barLength = num(o.barLength, "largo por barra");
    var count = num(o.count, "cantidad de barras"), waste = pct(o.waste, "margen");
    if (!Number.isInteger(count) || count > 1000000) throw Error("La cantidad de barras debe ser entera.");
    var netLength = barLength * count;
    var kgMeter = Math.PI / 4 * Math.pow(diameter / 1000, 2) * 7850;
    return { kgPerMeter: kgMeter, netLength: netLength, totalLength: netLength * (1 + waste),
      weightKg: netLength * (1 + waste) * kgMeter };
  }
  function materialWeight(o) {
    var m = DENSITIES[o.material];
    if (!m) throw Error("Elegí un material.");
    var volume = num(o.volume, "volumen"), density = num(o.density || m.density, "densidad");
    return { volumeM3: volume, densityKgM3: density, weightKg: volume * density, tonnes: volume * density / 1000, material: m };
  }
  function convert(o) {
    var units = { mm: { factor: .001, type: "length" }, cm: { factor: .01, type: "length" },
      m: { factor: 1, type: "length" }, km: { factor: 1000, type: "length" },
      cm2: { factor: .0001, type: "area" }, m2: { factor: 1, type: "area" },
      l: { factor: .001, type: "volume" }, m3: { factor: 1, type: "volume" },
      kg: { factor: 1, type: "mass" }, t: { factor: 1000, type: "mass" } };
    var from = units[o.from], to = units[o.to];
    if (!from || !to || from.type !== to.type) throw Error("Elegí unidades compatibles.");
    var value = num(o.value, "valor", true);
    return { result: value * from.factor / to.factor, from: o.from, to: o.to };
  }
  return { BRICKS: BRICKS, DENSITIES: DENSITIES, brickWall: brickWall, concrete: concrete,
    floor: floor, paint: paint, plaster: plaster, screed: screed, excavation: excavation,
    roof: roof, steel: steel, materialWeight: materialWeight, convert: convert };
});

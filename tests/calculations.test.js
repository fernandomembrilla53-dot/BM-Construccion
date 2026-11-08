"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const C=require("../calculations.js");
const almost=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,actual+" != "+expected);
test("muros: 4 + 8 + 4 + 8 m, alto 2,5 m, hueco 12",()=>{
 const r=C.brickWall({lengths:[4,8,4,8],height:2.5,openings:0,brick:"hueco12",waste:10,bagKg:30});
 assert.equal(r.netArea,60);assert.equal(r.units,990);assert.equal(r.pallets,7);
 assert.equal(r.brickWeightKg,4455);assert.equal(r.mortarBags,38);
});
test("hueco 8 y 18 usan rendimientos de fabricante",()=>{
 assert.equal(C.BRICKS.hueco8.units,15);assert.equal(C.BRICKS.hueco8.weight,3.3);
 assert.equal(C.BRICKS.hueco18.pallet,90);assert.equal(C.BRICKS.hueco18.weight,6);
});
test("hormigón: 4 × 3 × 10 cm con 5 % de reserva",()=>{
 const r=C.concrete({length:4,width:3,thickness:10,waste:5,density:2400});
 almost(r.netM3,1.2);almost(r.totalM3,1.26);almost(r.weightKg,3024);
});
test("pisos: cajas, piezas y bolsas se redondean hacia arriba",()=>{
 const r=C.floor({length:5,width:4,openings:0,tileWidth:60,tileLength:60,boxArea:2,glueRate:4,bagKg:25,waste:10});
 assert.equal(r.boxes,11);assert.equal(r.tiles,62);assert.equal(r.adhesiveBags,4);
});
test("pintura: rendimiento por mano y margen",()=>{
 const r=C.paint({area:40,openings:4,coverage:10,coats:2,waste:10});
 almost(r.liters,7.92);assert.equal(r.buckets20,1);assert.equal(r.cans4,2);
});
test("revoque: espesor en mm",()=>almost(C.plaster({area:50,openings:5,thickness:15,waste:10,density:1900}).volumeM3,.7425));
test("carpeta: espesor en cm",()=>almost(C.screed({area:25,thickness:5,waste:8,density:1900}).totalM3,1.35));
test("excavación: banco, suelto y viajes",()=>{
 const r=C.excavation({length:8,width:.6,depth:.8,swell:25,truck:6,density:1600});
 almost(r.bankM3,3.84);almost(r.looseM3,4.8);assert.equal(r.trucks,1);
});
test("techo: pendiente angular",()=>{
 const r=C.roof({length:8,width:5,angle:15,sheetArea:3,waste:10});
 almost(r.roofM2,40/Math.cos(Math.PI/12));assert.equal(r.sheets,16);
});
test("acero: fórmula geométrica de sección",()=>{
 const r=C.steel({diameter:10,barLength:12,count:10,waste:5});
 almost(r.kgPerMeter,Math.PI/4*.01*.01*7850);assert.ok(r.weightKg>70);
});
test("densidades de referencia y conversor",()=>{
 assert.equal(C.materialWeight({material:"concreto",volume:1,density:2400}).weightKg,2400);
 assert.equal(C.convert({value:100,from:"cm",to:"m"}).result,1);
 assert.equal(C.convert({value:1,from:"m3",to:"l"}).result,1000);
 assert.equal(C.convert({value:1,from:"t",to:"kg"}).result,1000);
});
test("rechaza entradas inválidas y condiciones imposibles",()=>{
 assert.throws(()=>C.concrete({length:0,width:3,thickness:10,waste:0}));
 assert.throws(()=>C.concrete({length:"-4",width:3,thickness:10,waste:0}));
 assert.throws(()=>C.floor({length:2,width:2,openings:4,waste:10,boxArea:2,tileWidth:40,tileLength:40,glueRate:4,bagKg:25}));
 assert.throws(()=>C.brickWall({lengths:[4],height:2,openings:8,brick:"hueco12",waste:10}));
 assert.throws(()=>C.paint({area:20,openings:0,coverage:10,coats:2.5,waste:0}));
 assert.throws(()=>C.roof({length:3,width:5,angle:80,sheetArea:3,waste:10}));
 assert.throws(()=>C.steel({diameter:10,barLength:12,count:1.5,waste:10}));
 assert.throws(()=>C.convert({value:10,from:"kg",to:"m"}));
 assert.throws(()=>C.concrete({length:1,width:1,thickness:1,waste:200}));
});
test("archivos PWA y rutas de referencia presentes",()=>{
 const root=path.resolve(__dirname,"..");
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 for(const f of ["styles.css","app.js","calculations.js","manifest.json","sw.js","privacidad.html","terminos.html","fuentes.html"]){
  assert.ok(fs.existsSync(path.join(root,f)),f+" no existe");
 }
 for(const id of ["calc-form","tool-fields","tool-list","results","save-result","saved-list","project-name","history-dialog"]){
  assert.ok(html.includes('id="'+id+'"'),id+" faltante");
 }
});

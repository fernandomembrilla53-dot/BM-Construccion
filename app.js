/* BM Construcción · interfaz / almacenamiento 3.0 */
(function () {
  "use strict";
  var C = window.BMCalc;
  if (!C) { document.body.textContent = "No se pudo cargar el motor de cálculos."; return; }
  var $ = function (id) { return document.getElementById(id); };
  var FIELD = function (id, label, value, unit, hint) { return { id:id, label:label, value:String(value), unit:unit || "", hint:hint || "", kind:"number" }; };
  var SELECT = function (id, label, value, choices, hint) { return { id:id, label:label, value:value, choices:choices, hint:hint || "", kind:"select" }; };
  var brickChoices = Object.keys(C.BRICKS).map(function (id) { return [id,C.BRICKS[id].label]; });
  var densityChoices = Object.keys(C.DENSITIES).map(function (id) { return [id,C.DENSITIES[id].label]; });
  var unitChoices = [["mm","Milímetros (mm)"],["cm","Centímetros (cm)"],["m","Metros (m)"],["km","Kilómetros (km)"],["cm2","Centímetros cuadrados (cm²)"],["m2","Metros cuadrados (m²)"],["l","Litros (L)"],["m3","Metros cúbicos (m³)"],["kg","Kilogramos (kg)"],["t","Toneladas (t)"]];
  var TOOLS = [
    { id:"muros",cat:"MATERIALES",number:"01",title:"Ladrillos y muros",menu:"Muros y ladrillos",subtitle:"Unidades, pallets y mezcla",desc:"Sumá todas las paredes y calculá ladrillos, pallets, masa aproximada y mortero de asiento.",
      note:"Rendimientos basados en fichas de Cerámica Ctibor y Sika Argentina; el ladrillo común y el bloque son estimaciones configurables. El peso corresponde solo a las piezas, no al muro completo. Un pallet es una unidad logística y puede variar según fabricante.",
      fields:[{kind:"walls"},FIELD("height","Alto de paredes",2.5,"m"),FIELD("openings","Puertas y ventanas a descontar",0,"m²"),SELECT("brick","Tipo de ladrillo","hueco12",brickChoices),FIELD("waste","Desperdicio",10,"%"),FIELD("bagKg","Bolsa de mortero premezclado",30,"kg","La cantidad de bolsas supone usar mortero listo; no equivale a bolsas de cemento.")],
      calculate:function (v) { return C.brickWall(v); },
      metrics:function (r) { return [m("Ladrillos a comprar",r.units,"unidades",true),m("Superficie neta",r.netArea,"m²"),m("Pallets completos",r.pallets,"pallets"),m("Peso de piezas",r.brickWeightKg,"kg"),m("Mortero estimado",r.mortarKg,"kg"),m("Bolsas de mortero",r.mortarBags,"bolsas")]; },
      price:function(r){return {qty:r.units,unit:"ladrillo"};},advice:"Verificá ficha y configuración real de juntas, cortes y tipo de muro." },
    { id:"hormigon",cat:"MATERIALES",number:"02",title:"Hormigón",menu:"Hormigón",subtitle:"Volumen y peso",desc:"Calculá una losa, platea o volumen prismático simple en metros cúbicos y litros.",
      note:"El espesor se ingresa en centímetros. El peso se estima con densidad orientativa editable; esto NO determina resistencia, armado, dosificación ni seguridad de una estructura.",
      fields:[FIELD("length","Largo",4,"m"),FIELD("width","Ancho",3,"m"),FIELD("thickness","Espesor",10,"cm"),FIELD("waste","Margen adicional",5,"%"),FIELD("density","Densidad estimada",2400,"kg/m³","Hormigón normal ≈ 2.400 kg/m³; ajustar al producto.")],
      calculate:C.concrete,metrics:function(r){return [m("Hormigón a pedir",r.totalM3,"m³",true),m("Volumen neto",r.netM3,"m³"),m("Equivalente en litros",r.totalLiters,"L"),m("Masa estimada",r.weightKg,"kg")];},
      price:function(r){return {qty:r.totalM3,unit:"m³"};},advice:"La cantidad de hormigón no equivale a una receta de mezcla. Consultá a un profesional para elementos resistentes." },
    { id:"pisos",cat:"TERMINACIONES",number:"03",title:"Pisos y revestimientos",menu:"Pisos y cerámicos",subtitle:"Cajas y adhesivo",desc:"Estimá cajas, piezas y consumo orientativo de adhesivo a partir de tus medidas.",
      note:"Las cajas se redondean hacia arriba. El consumo de adhesivo es editable y depende del producto, soporte, tamaño de placa y llana. Verificá la ficha técnica.",
      fields:[FIELD("length","Largo del ambiente",5,"m"),FIELD("width","Ancho del ambiente",4,"m"),FIELD("openings","Área a descontar",0,"m²"),FIELD("tileWidth","Ancho de pieza",60,"cm"),FIELD("tileLength","Largo de pieza",60,"cm"),FIELD("boxArea","Cobertura por caja",2,"m²"),FIELD("glueRate","Adhesivo por m²",4,"kg/m²"),FIELD("bagKg","Bolsa de adhesivo",25,"kg"),FIELD("waste","Desperdicio por cortes",10,"%")],
      calculate:C.floor,metrics:function(r){return [m("Cajas a comprar",r.boxes,"cajas",true),m("Superficie con recorte",r.purchaseArea,"m²"),m("Piezas teóricas",r.tiles,"unidades"),m("Adhesivo orientativo",r.adhesiveKg,"kg"),m("Bolsas de adhesivo",r.adhesiveBags,"bolsas"),m("Superficie neta",r.netArea,"m²")];},
      price:function(r){return {qty:r.boxes,unit:"caja"};},advice:"Pedí cajas del mismo lote y confirmá las dimensiones útiles y la cobertura declarada." },
    { id:"pintura",cat:"TERMINACIONES",number:"04",title:"Pintura",menu:"Pintura",subtitle:"Litros y manos",desc:"Calculá litros para paredes y techos, descontando áreas que no se pintan.",
      note:"El rendimiento depende de la superficie y del fabricante. Los envases de 20 L y de 4 L son alternativas de compra, no se suman entre sí.",
      fields:[FIELD("area","Superficie total",40,"m²"),FIELD("openings","Aberturas y áreas sin pintar",4,"m²"),FIELD("coverage","Rendimiento por litro y mano",10,"m²/L"),FIELD("coats","Manos de pintura",2,"manos"),FIELD("waste","Margen de reserva",10,"%")],
      calculate:C.paint,metrics:function(r){return [m("Pintura estimada",r.liters,"L",true),m("Superficie neta",r.netArea,"m²"),m("Opción: baldes 20 L",r.buckets20,"baldes"),m("Opción: latas 4 L",r.cans4,"latas")];},
      price:function(r){return {qty:r.liters,unit:"litro"};},advice:"Considerá imprimación, absorción del sustrato y tipo de terminación." },
    { id:"revoque",cat:"TERMINACIONES",number:"05",title:"Revoques",menu:"Revoques",subtitle:"Espesor y volumen",desc:"Estimá la cantidad de mezcla fresca para revestir muros a un espesor definido.",
      note:"El peso indicado es de mezcla fresca a partir de una densidad orientativa. NO es equivalente al peso de mortero seco por bolsa; consultá el rendimiento del fabricante.",
      fields:[FIELD("area","Superficie",50,"m²"),FIELD("openings","Área a descontar",5,"m²"),FIELD("thickness","Espesor",15,"mm"),FIELD("waste","Margen por irregularidades",10,"%"),FIELD("density","Densidad de mezcla fresca",1900,"kg/m³")],
      calculate:C.plaster,metrics:function(r){return [m("Volumen de mezcla fresca",r.volumeM3,"m³",true),m("Superficie a revocar",r.netArea,"m²"),m("Masa fresca orientativa",r.freshKg,"kg")];},
      price:function(r){return {qty:r.netArea,unit:"m²"};},advice:"Los rendimientos comerciales de morteros premezclados son distintos de la masa fresca." },
    { id:"carpeta",cat:"MATERIALES",number:"06",title:"Carpetas y contrapisos",menu:"Carpetas",subtitle:"Espesor y mezcla",desc:"Calculá el volumen de mortero o contrapiso por superficie y espesor.",
      note:"La densidad varía entre carpeta de mortero y contrapiso liviano. Elegí un valor apropiado; los resultados no dan una dosificación para obra.",
      fields:[FIELD("area","Superficie",25,"m²"),FIELD("thickness","Espesor promedio",5,"cm"),FIELD("waste","Margen adicional",8,"%"),FIELD("density","Densidad estimada",1900,"kg/m³")],
      calculate:C.screed,metrics:function(r){return [m("Mezcla a preparar",r.totalM3,"m³",true),m("Volumen neto",r.netM3,"m³"),m("Equivalente",r.totalLiters,"L"),m("Masa estimada",r.weightKg,"kg")];},
      price:function(r){return {qty:r.totalM3,unit:"m³"};},advice:"Corregí el espesor a partir de niveles medidos en el sitio." },
    { id:"excavacion",cat:"MOVIMIENTO DE SUELO",number:"07",title:"Excavación y movimiento de suelo",menu:"Excavaciones",subtitle:"m³ y viajes",desc:"Estimá tierra en banco, volumen suelto y viajes de transporte.",
      note:"El esponjamiento depende del suelo y del método de excavación. El peso corresponde al volumen en banco con la densidad asumida. Revisá la capacidad de carga real del vehículo.",
      fields:[FIELD("length","Largo",8,"m"),FIELD("width","Ancho",0.6,"m"),FIELD("depth","Profundidad",0.8,"m"),FIELD("swell","Esponjamiento del material",25,"%"),FIELD("truck","Volumen por viaje",6,"m³"),FIELD("density","Densidad estimada en banco",1600,"kg/m³")],
      calculate:C.excavation,metrics:function(r){return [m("Volumen excavado",r.bankM3,"m³",true),m("Material suelto",r.looseM3,"m³"),m("Viajes mínimos por volumen",r.trucks,"viajes"),m("Peso aproximado del suelo",r.estimatedKg,"kg")];},
      price:function(r){return {qty:r.bankM3,unit:"m³"};},advice:"La cantidad de viajes por volumen no verifica el límite de peso del camión." },
    { id:"techo",cat:"CUBIERTAS",number:"08",title:"Techos y chapas",menu:"Techos",subtitle:"Pendiente y cobertura",desc:"Calculá superficie inclinada y chapas según su área útil declarada.",
      note:"Solo cubiertas geométricas rectangulares simples. No considera solapes específicos, cumbreras, aleros, viento, estructura ni impermeabilización.",
      fields:[FIELD("length","Largo horizontal proyectado",8,"m"),FIELD("width","Ancho horizontal proyectado",5,"m"),FIELD("angle","Inclinación del techo",15,"°"),FIELD("sheetArea","Cobertura útil por chapa",3,"m²","Usá la cobertura útil, ya descontados solapes."),FIELD("waste","Margen por cortes",10,"%")],
      calculate:C.roof,metrics:function(r){return [m("Área real inclinada",r.roofM2,"m²",true),m("Superficie proyectada",r.projectedM2,"m²"),m("Compra con margen",r.purchaseArea,"m²"),m("Chapas aproximadas",r.sheets,"unidades")];},
      price:function(r){return {qty:r.sheets,unit:"chapa"};},advice:"Para pendiente a dos aguas, verificá que la geometría y largo de faldones representen tu techo." },
    { id:"hierro",cat:"MATERIALES",number:"09",title:"Hierro y barras",menu:"Hierro y barras",subtitle:"Metros y kilos",desc:"Estimá el peso de barras redondas macizas según diámetro, largo y cantidad.",
      note:"Fórmula geométrica de sección circular y densidad de acero 7.850 kg/m³. No calcula acero de refuerzo necesario ni verifica su diseño estructural.",
      fields:[FIELD("diameter","Diámetro de barra",10,"mm"),FIELD("barLength","Longitud por barra",12,"m"),FIELD("count","Cantidad de barras",10,"unid."),FIELD("waste","Reserva por recortes",5,"%")],
      calculate:C.steel,metrics:function(r){return [m("Peso de hierro",r.weightKg,"kg",true),m("Peso por metro",r.kgPerMeter,"kg/m"),m("Largo con margen",r.totalLength,"m"),m("Longitud de barras",r.netLength,"m")];},
      price:function(r){return {qty:r.weightKg,unit:"kg"};},advice:"No usar esta herramienta para dimensionar columnas, vigas o fundaciones." },
    { id:"pesos",cat:"REFERENCIAS",number:"10",title:"Pesos y volúmenes",menu:"Pesos de materiales",subtitle:"Densidad y toneladas",desc:"Convertí volúmenes en masa con una densidad editable de referencia.",
      note:"Densidades representativas basadas en referencias técnicas, susceptibles a humedad, porosidad, compactación y fabricante. Para cálculo estructural deben emplearse valores normativos de proyecto.",
      fields:[SELECT("material","Tipo de material","concreto",densityChoices),FIELD("volume","Volumen de material",1,"m³"),FIELD("density","Densidad del material",2400,"kg/m³","Podés modificarla según ficha técnica.")],
      calculate:C.materialWeight,metrics:function(r){return [m("Peso estimado",r.weightKg,"kg",true),m("Equivalencia",r.tonnes,"toneladas"),m("Volumen",r.volumeM3,"m³"),m("Densidad usada",r.densityKgM3,"kg/m³")];},
      price:function(r){return {qty:r.weightKg,unit:"kg"};},advice:"El material húmedo o compactado puede pesar mucho más que el estimado." },
    { id:"unidades",cat:"REFERENCIAS",number:"11",title:"Convertidor de unidades",menu:"Conversor de unidades",subtitle:"Metros, litros y más",desc:"Pasá entre unidades de largo, superficie, volumen o masa sin mezclar magnitudes.",
      note:"1 m³ equivale a 1.000 litros; 1 t equivale a 1.000 kg. Solo se aceptan conversiones de la misma magnitud.",
      fields:[FIELD("value","Valor a convertir",100,""),SELECT("from","Desde","cm",unitChoices),SELECT("to","Hacia","m",unitChoices)],
      calculate:C.convert,metrics:function(r){return [m("Resultado",r.result,r.to,true)];},
      price:null,advice:"Las conversiones no implican ningún supuesto constructivo." }
  ];
  var toolById={}; TOOLS.forEach(function (t) { toolById[t.id]=t; });
  var RECORDS_KEY="bm-construccion-records-v3";
  var PROJECT_KEY="bm-construccion-project-v3";
  function loadRecords() {
    try {
      var raw=JSON.parse(localStorage.getItem(RECORDS_KEY)||"[]");
      return Array.isArray(raw) ? raw.filter(function (r) { return r && typeof r === "object" && typeof r.tool === "string" && typeof r.project === "string"; }).slice(0,250) : [];
    } catch(e) { return []; }
  }
  function storedProject() { try { return localStorage.getItem(PROJECT_KEY)||"Mi obra"; } catch(e) { return "Mi obra"; } }
  var state={tool:"muros",last:null,records:loadRecords(),project:storedProject()};
  var fmt=new Intl.NumberFormat("es-AR",{maximumFractionDigits:2});
  var money=new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0});
  function f(n) { return n===null || n===undefined ? "—" : fmt.format(n); }
  function m(label,value,unit,primary) {return {label:label,value:value,unit:unit,primary:!!primary};}
  function make(tag,cls,txt) {var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e;}
  function showToast(text) {var e=$("toast");e.textContent=text;e.classList.add("visible");clearTimeout(showToast.timer);showToast.timer=setTimeout(function(){e.classList.remove("visible");},3300);}
  function saveLocal() {try {localStorage.setItem(RECORDS_KEY,JSON.stringify(state.records));return true;}catch(e){showToast("No se pudo guardar: almacenamiento lleno o deshabilitado.");return false;}}
  function projectName() {return $("project-name").value.trim().slice(0,70)||"Mi obra";}
  function renderTools(query) {
    var list=$("tool-list");list.replaceChildren();
    var lastCat="";
    var hits=TOOLS.filter(function(t){return (t.title+" "+t.subtitle+" "+t.cat).toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es"));});
    hits.forEach(function(t){
      if(t.cat!==lastCat){list.appendChild(make("div","menu-title",t.cat));lastCat=t.cat;}
      var b=make("button","tool-link");b.type="button";b.setAttribute("aria-current",state.tool===t.id?"page":"false");b.dataset.tool=t.id;
      b.appendChild(make("span","tool-index",t.number));
      var txt=make("span");txt.appendChild(make("span","tool-label",t.menu));txt.appendChild(make("div","tool-sublabel",t.subtitle));b.appendChild(txt);
      b.addEventListener("click",function(){selectTool(t.id);});
      list.appendChild(b);
    });
    if(!hits.length)list.appendChild(make("p","muted-small","No hay calculadoras con ese nombre."));
  }
  function fieldElement(field){
    var wrap=make("div","field"+(field.kind==="select"?" full":""));
    var label=make("label","field-label",field.label);label.htmlFor="f-"+field.id;wrap.appendChild(label);
    if(field.kind==="select"){
      var sel=make("select");sel.id="f-"+field.id;sel.dataset.name=field.id;
      field.choices.forEach(function(c){var opt=document.createElement("option");opt.value=c[0];opt.textContent=c[1];sel.appendChild(opt);});sel.value=field.value;wrap.appendChild(sel);
    }else{
      var hold=make("div","input-wrap");
      var input=make("input");input.type="text";input.inputMode="decimal";input.autocomplete="off";input.spellcheck=false;input.value=field.value;input.id="f-"+field.id;input.dataset.name=field.id;
      input.setAttribute("aria-label",field.label+(field.unit?" en "+field.unit:""));
      hold.appendChild(input);if(field.unit)hold.appendChild(make("span","suffix",field.unit));wrap.appendChild(hold);
    }
    if(field.hint)wrap.appendChild(make("span","field-help",field.hint));
    return wrap;
  }
  function addWall(value) {
    var list=$("wall-list");
    if(list.children.length>=100){showToast("Máximo 100 paredes por cálculo.");return;}
    var row=make("div","wall-row");var label=make("label","", "Pared "+(list.children.length+1));
    var input=make("input");input.className="wall-input";input.type="text";input.inputMode="decimal";input.value=value===undefined?"":String(value);input.setAttribute("aria-label","Largo de pared en metros");label.appendChild(input);
    var remove=make("button","wall-remove","×");remove.type="button";remove.setAttribute("aria-label","Quitar pared");remove.addEventListener("click",function(){if(list.children.length>1){row.remove();numberWalls();}});
    row.appendChild(label);row.appendChild(remove);list.appendChild(row);
  }
  function numberWalls() {Array.prototype.forEach.call(document.querySelectorAll(".wall-row label"),function(l,i){l.firstChild.textContent="Pared "+(i+1);});}
  function wallInput(){
    var fs=make("fieldset","wall-fieldset");var legend=make("legend","","Largos de paredes (metros)");fs.appendChild(legend);
    var div=make("div","wall-list");div.id="wall-list";fs.appendChild(div);
    var add=make("button","add-wall","+ Agregar pared");add.type="button";add.addEventListener("click",function(){addWall("");});fs.appendChild(add);
    return fs;
  }
  function selectTool(id){
    var t=toolById[id];if(!t)return;
    state.tool=id;state.last=null;
    $("search-tools").value="";
    renderTools("");
    $("tool-category").textContent=t.cat;
    $("tool-title").textContent=t.title;
    $("tool-description").textContent=t.desc;
    $("tool-symbol").textContent=t.number;
    $("tool-note").textContent=t.note;
    $("calc-error").hidden=true;
    $("save-result").disabled=true;$("copy-result").disabled=true;$("print-result").disabled=true;
    var fields=$("tool-fields");fields.replaceChildren();
    t.fields.forEach(function(field){fields.appendChild(field.kind==="walls"?wallInput():fieldElement(field));});
    if(id==="muros") [4,8,4,8].forEach(addWall);
    if(t.price) {
      var price=FIELD("price","Precio por "+(id==="muros"?"ladrillo":id==="pisos"?"caja":id==="pintura"?"litro":id==="revoque"?"m²":id==="techo"?"chapa":id==="hierro"||id==="pesos"?"kg":"m³")+" (opcional)","", "$","Solo para tu presupuesto, en pesos argentinos. Sin cotización automática.");
      fields.appendChild(fieldElement(price));
    }
    if(id==="pesos")$("f-material").addEventListener("change",function(){$("f-density").value=C.DENSITIES[this.value].density;});
    renderEmpty();
    runCalc(true);
    if(location.hash!==("#"+id))history.replaceState(null,"","#"+id);
    if(window.matchMedia("(max-width: 780px)").matches) $("workspace").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function renderEmpty(){var results=$("results");results.replaceChildren();var empty=make("div","empty-result");empty.appendChild(make("div","empty-figure","BM / OBRA"));empty.appendChild(make("h3","","Listo para calcular"));empty.appendChild(make("p","","Completá las medidas y calculá."));results.appendChild(empty);}
  function valuesFromForm(){
    var o={};
    Array.prototype.forEach.call(document.querySelectorAll("#tool-fields [data-name]"),function(el){o[el.dataset.name]=el.value;});
    if(state.tool==="muros")o.lengths=Array.prototype.map.call(document.querySelectorAll(".wall-input"),function(el){return el.value;});
    return o;
  }
  function parseOptionalPrice(raw) {
    if(raw===undefined || raw===null || String(raw).trim()==="")return null;
    var norm=String(raw).trim().replace(",",".");
    if(!/^\d+(\.\d+)?$/.test(norm) || !Number.isFinite(Number(norm)) || Number(norm)>1e12) throw Error("El precio debe ser positivo o cero, sin separadores de miles.");
    return Number(norm);
  }
  function runCalc(silent){
    var t=toolById[state.tool],v=valuesFromForm();
    try{
      var price=parseOptionalPrice(v.price),result=t.calculate(v),metrics=t.metrics(result),primary=t.price?t.price(result):null;
      var amount=(price!==null&&primary)?price*primary.qty:null;
      if(amount!==null&&!Number.isFinite(amount))throw Error("El importe calculado es demasiado grande.");
      state.last={tool:t.id,metrics:metrics,result:result,price:price,primary:primary,amount:amount};
      $("calc-error").hidden=true;renderResult(t,metrics,amount,primary);
      $("save-result").disabled=!primary;$("copy-result").disabled=false;$("print-result").disabled=false;
    }catch(e){
      state.last=null;$("save-result").disabled=true;$("copy-result").disabled=true;$("print-result").disabled=true;renderEmpty();
      if(!silent){$("calc-error").textContent=e.message||"Error en las medidas.";$("calc-error").hidden=false;}
    }
  }
  function renderResult(t,metrics,amount,primary){
    var box=$("results");box.replaceChildren();
    box.appendChild(make("div","result-title","RESULTADO ESTIMADO · "+t.title.toLocaleUpperCase("es")));
    var grid=make("div","result-grid");
    metrics.forEach(function(it){if(it.value===null||it.value===undefined)return;
      var card=make("div","result-metric"+(it.primary?" primary":""));card.appendChild(make("div","result-value",f(it.value)));
      card.appendChild(make("div","result-unit",it.unit));card.appendChild(make("div","result-label",it.label));grid.appendChild(card);
    });
    if(amount!==null){var cost=make("div","result-metric primary");cost.appendChild(make("div","result-value",money.format(amount)));cost.appendChild(make("div","result-unit","Precio orientativo"));cost.appendChild(make("div","result-label",f(primary.qty)+" "+primary.unit+(primary.qty===1?"":"s")+" × precio unitario ingresado"));grid.appendChild(cost);}
    box.appendChild(grid);box.appendChild(make("div","result-advice",t.advice));
  }
  function copyString(){
    if(!state.last)return "";
    var t=toolById[state.last.tool];
    return "BM Construcción · "+t.title+"\n"+state.last.metrics.filter(function(i){return i.value!==null;}).map(function(i){return i.label+": "+f(i.value)+" "+i.unit;}).join("\n")+(state.last.amount===null?"":"\nCosto orientativo: "+money.format(state.last.amount))+"\nEstimación preliminar. Verificá en obra.";
  }
  function saveResult(){
    if(!state.last||!state.last.primary)return;
    var last=state.last,record={id:String(Date.now())+"-"+Math.random().toString(16).slice(2,9),date:new Date().toISOString(),
      project:projectName(),tool:last.tool,title:toolById[last.tool].title,qty:last.primary.qty,unit:last.primary.unit,
      amount:last.amount,price:last.price,summary:last.metrics.filter(function(a){return a.value!==null;}).map(function(a){return a.label+": "+f(a.value)+" "+a.unit;}).join(" · ")};
    state.records.unshift(record);state.records=state.records.slice(0,250);
    if(saveLocal()){renderRecords();showToast("Cálculo guardado en «"+record.project+"».");}
  }
  function allProjectRecords(){return state.records.filter(function(r){return r.project===projectName();});}
  function renderRecords(){
    var rows=allProjectRecords(),out=$("saved-list");out.replaceChildren();
    $("saved-count").textContent=f(rows.length);
    var total=rows.reduce(function(sum,r){return sum+(typeof r.amount==="number"&&Number.isFinite(r.amount)?r.amount:0);},0);
    $("project-total").textContent=money.format(total);
    var enable=rows.length===0;$("export-csv").disabled=enable;$("export-json").disabled=enable;
    if(enable){out.appendChild(make("p","muted-small","Todavía no guardaste cálculos en este proyecto."));return;}
    rows.slice(0,4).forEach(function(r){var el=make("div","record"),txt=make("div");txt.appendChild(make("strong","",r.title));txt.appendChild(make("span","",f(r.qty)+" "+r.unit));
      el.appendChild(txt);el.appendChild(make("b","",r.amount===null?"—":money.format(r.amount)));out.appendChild(el);
    });
  }
  function openHistory(){
    var rows=allProjectRecords(),content=$("history-content");content.replaceChildren();
    content.appendChild(make("p","muted-small","Proyecto: "+projectName()+". Los registros con precio forman un subtotal de referencia. Si guardás alternativas, también se suman."));
    if(!rows.length)content.appendChild(make("p","muted-small","No hay registros."));
    rows.forEach(function(r){
      var div=make("div","history-item"),info=make("div");
      info.appendChild(make("strong","",r.title+" · "+f(r.qty)+" "+r.unit));
      info.appendChild(make("small","",new Date(r.date).toLocaleString("es-AR")+" · "+(r.amount===null?"Sin precio":money.format(r.amount))));
      var remove=make("button","","Quitar");remove.type="button";remove.setAttribute("aria-label","Quitar "+r.title);
      remove.addEventListener("click",function(){state.records=state.records.filter(function(x){return x.id!==r.id;});saveLocal();renderRecords();openHistory();});
      div.appendChild(info);div.appendChild(remove);content.appendChild(div);
    });
    if(!$("history-dialog").open)$("history-dialog").showModal();
  }
  function csvCell(x){
    var str=String(x===null||x===undefined?"":x);
    if(/^[\s]*[=+\-@\t\r]/.test(str))str="'"+str;
    return '"'+str.replace(/"/g,'""')+'"';
  }
  function downloadFile(filename,text,type){
    if(window.BMAndroid && typeof window.BMAndroid.saveFile==="function"){
      window.BMAndroid.saveFile(filename,text,type.split(";")[0]);return;
    }
    var blob=new Blob([text],{type:type}),url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},3000);
  }
  function cleanFileName(name){return name.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9-]/g,"-").slice(0,40)||"mi-obra";}
  function exportCSV(){
    var rows=allProjectRecords();if(!rows.length)return;
    var lines=[["Proyecto","Fecha","Herramienta","Cantidad","Unidad","Precio unitario ARS","Subtotal ARS","Detalle"].map(csvCell).join(",")];
    rows.forEach(function(r){lines.push([r.project,r.date,r.title,r.qty,r.unit,r.price,r.amount,r.summary].map(csvCell).join(","));});
    downloadFile("BM-Construccion-"+cleanFileName(projectName())+".csv","\ufeff"+lines.join("\r\n"),"text/csv;charset=utf-8");
    showToast("Presupuesto exportado a CSV.");
  }
  function exportJSON(){
    var rows=allProjectRecords();if(!rows.length)return;
    downloadFile("BM-Construccion-"+cleanFileName(projectName())+".json",JSON.stringify({app:"BM Construcción",version:3,project:projectName(),created:new Date().toISOString(),records:rows},null,2),"application/json;charset=utf-8");
    showToast("Copia descargada. Podés conservarla como respaldo.");
  }
  function initInstall(){
    var deferred=null;
    window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;$("install-app").hidden=false;});
    $("install-app").addEventListener("click",function(){if(!deferred)return;deferred.prompt();deferred.userChoice.finally(function(){deferred=null;$("install-app").hidden=true;});});
    window.addEventListener("appinstalled",function(){$("install-app").hidden=true;showToast("BM Construcción instalada.");});
  }
  function updateConnection(){
    $("network-status").textContent=navigator.onLine?"Disponible sin conexión":"Trabajando sin internet";
  }
  function init(){
    $("project-name").value=state.project;
    $("project-name").addEventListener("change",function(){state.project=projectName();this.value=state.project;try{localStorage.setItem(PROJECT_KEY,state.project);}catch(e){}renderRecords();});
    $("search-tools").addEventListener("input",function(){renderTools(this.value.trim());});
    $("calc-form").addEventListener("submit",function(e){e.preventDefault();runCalc(false);});
    $("reset-tool").addEventListener("click",function(){selectTool(state.tool);});
    $("save-result").addEventListener("click",saveResult);
    $("copy-result").addEventListener("click",function(){var text=copyString();if(!text)return;
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){showToast("Resultado copiado.");}).catch(function(){showToast("No se pudo copiar en este dispositivo.");});}
      else {var a=make("textarea");a.value=text;document.body.appendChild(a);a.select();try{document.execCommand("copy");showToast("Resultado copiado.");}catch(e){showToast("El portapapeles no está disponible.");}a.remove();}
    });
    $("print-result").addEventListener("click",function(){if(window.BMAndroid && typeof window.BMAndroid.printDocument==="function")window.BMAndroid.printDocument();else window.print();});
    $("export-csv").addEventListener("click",exportCSV);$("export-json").addEventListener("click",exportJSON);
    $("view-history").addEventListener("click",openHistory);
    $("close-history").addEventListener("click",function(){$("history-dialog").close();});
    $("delete-history").addEventListener("click",function(){
      if(!allProjectRecords().length)return;
      if(!window.confirm("¿Borrar todos los registros guardados de «"+projectName()+"»? Esta acción no se puede deshacer."))return;
      state.records=state.records.filter(function(r){return r.project!==projectName();});saveLocal();renderRecords();openHistory();showToast("Cálculos del proyecto borrados.");
    });
    initInstall();updateConnection();window.addEventListener("online",updateConnection);window.addEventListener("offline",updateConnection);
    renderRecords();
    var hash=location.hash.slice(1);
    selectTool(toolById[hash]?hash:"muros");
    if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){console.warn("Modo sin conexión no disponible.");});});
  }
  init();
})();
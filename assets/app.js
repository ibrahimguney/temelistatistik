'use strict';
(() => {
  const $=id=>document.getElementById(id),S=LabStats;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const fmt=(v,d=3)=>v===null||v===undefined?'—':Number.isFinite(v)?v.toLocaleString('tr-TR',{maximumFractionDigits:d,minimumFractionDigits:d}):'Tanımsız';
  const ptxt=p=>p<.001?'p < 0,001':`p = ${fmt(p)}`;
  const interval=(lo,hi)=>`[${fmt(lo)}; ${fmt(hi)}]`;
  const missing=v=>v===null||v===undefined||v==='';
  const methods={
    frequency:{name:'Frekans ve yüzdeler',kind:'category',hint:'Bir kategorik değişkenin dağılımı.',assume:['Ölçme düzeyi ile tablo türü uyumlu mu?','Eksik kayıtlar paydadan çıkarılır; sayıları ayrıca gösterilir.']},
    describe:{name:'Betimsel istatistik ve histogram',kind:'numeric',hint:'Merkez, yayılım ve dağılım biçimini birlikte inceleyin.',assume:['Değer aralıkları ve eksik veri kodları doğru mu?','Aykırı değerleri kaynağı doğrulamadan silmeyin.']},
    zscore:{name:'Standart puanlar (z)',kind:'numeric',hint:'Her gözlemi örneklem ortalaması ve standart sapmasıyla karşılaştırın.',assume:['Standart sapma sıfırdan büyük olmalıdır.','Standartlaştırma dağılımın biçimini değiştirmez.']},
    sampling:{name:'Örnekleme benzetimi',kind:'numeric',hint:'Veri havuzundan yerine koyarak 500 örnek seçilir.',assume:['Veri havuzu yalnız benzetimde bilinen bir örnek evren kabul edilir.','Bu benzetim seçim yanlılığını veya küme örneklemesini modellemez.']},
    ci:{name:'Ortalama için güven aralığı',kind:'numeric',hint:'Student t dağılımıyla ortalama için güven aralığı.',assume:['Gözlemler bağımsız mı ve örnekleme hedef evrene uygun mu?','Küçük örneklemde yaklaşık normallik ve etkili aykırı değerler incelenmelidir.']},
    one:{name:'Tek örneklem t testi',kind:'numeric',hint:'Bir ortalamayı belirlediğiniz H₀ değeriyle karşılaştırın.',assume:['H₀ değeri ve çift yönlü hipotez sonuçtan önce belirlenmeli.','Gözlemler bağımsız; küçük örneklemde dağılım yaklaşık normal olmalı.']},
    paired:{name:'Eşleştirilmiş t testi',kind:'pair',hint:'Fark ikinci ölçüm − birinci ölçüm olarak hesaplanır.',assume:['İki ölçüm aynı satırda aynı öğrenciye ait mi?','Öğrenciler birbirinden bağımsız mı?','Küçük örneklemde farkların dağılımı yaklaşık normal olmalı.']},
    welch:{name:'Bağımsız gruplar: Welch t testi',kind:'group',hint:'İki grubun ortalaması; eşit varyans varsayımı gerekmez.',assume:['Tam olarak iki bağımsız grup seçilmeli.','Küçük gruplarda yaklaşık normallik ve etkili gözlemler incelenmeli.','Fark tabloda gösterilen ilk grup − ikinci grup yönündedir.']},
    anova:{name:'Tek yönlü ANOVA',kind:'group',hint:'İki veya daha fazla bağımsız grubun genel karşılaştırması.',assume:['Gruplar ve gözlemler bağımsız mı?','Grup içi hatalar yaklaşık normal ve varyanslar benzer mi?','Genel test hangi grupların farklı olduğunu göstermez.']},
    pearson:{name:'Pearson korelasyonu',kind:'pair',hint:'İki nicel değişkenin doğrusal ilişkisi; Fisher z güven aralığı.',assume:['İlişki doğrusal mı? Etkili aykırı gözlem var mı?','Çıkarım için bağımsız çiftler ve yaklaşık iki değişkenli normallik gerekir.','Korelasyon nedensellik göstermez.']},
    spearman:{name:'Spearman sıra korelasyonu',kind:'pair',rank:true,hint:'Sıralı veya nicel değişkenlerin tekdüze ilişkisi.',assume:['Gözlem çiftleri bağımsız mı?','İlişki tekdüze mi?','p değeri t yaklaşımıdır; küçük örnekte permütasyon tercih edilebilir.']},
    regression:{name:'Basit doğrusal regresyon',kind:'pair',hint:'Y = sabit + eğim × X; gözlenen aralıkta doğrusal yordama.',assume:['Doğrusallık, bağımsız hatalar ve sabit hata varyansı incelenmeli.','Küçük örneklemde çıkarım için hata normalliği gerekir.','Gözlenen X aralığı dışında tahmin yapmayın.']},
    chi:{name:'Ki-kare bağımsızlık testi',kind:'categories',hint:'Çapraz tablo; Pearson ki-kare (Yates düzeltmesi yok).',assume:['Her satır bağımsız bir gözlem mi?','Beklenen frekanslar yeterli mi? Uyarıları kontrol edin.','Seyrek 2×2 tabloda Fisher exact testi değerlendirilmeli.']},
    mann:{name:'Mann–Whitney U',kind:'group',rank:true,hint:'İki bağımsız grubun sıra dağılımı; asimptotik p.',assume:['İki bağımsız grup; en az sıralı ölçüm.','Medyan farkı yorumu için benzer dağılım şekilleri gerekir.','Bağ düzeltmesi ve 0,5 süreklilik düzeltmesi uygulanır.']},
    wilcoxon:{name:'Wilcoxon işaretli sıralar',kind:'pair',rank:true,hint:'Eşleştirilmiş farklar; sıfır farklar çıkarılır, asimptotik p.',assume:['Aynı öğrenciye ait iki ölçüm doğru eşleşmiş mi?','Farkların simetrisi ve fark büyüklüklerinin karşılaştırılabilirliği gerekir.','Bağ ve 0,5 süreklilik düzeltmesi uygulanır.']},
    kruskal:{name:'Kruskal–Wallis',kind:'group',rank:true,hint:'İki veya daha fazla bağımsız grubun sıra dağılımı.',assume:['Bağımsız gözlemler ve en az sıralı ölçüm gerekir.','Medyan yorumu için benzer dağılım şekilleri gerekir.','Küçük gruplarda ki-kare yaklaşımı zayıflayabilir.']}
  };
  let chapter=null,dataset=LAB_DATA[0],last=null,notes={};
  const noteIds=['research-question','interpretation','limitations'];
  const list=(items,tag='li')=>items.map(s=>`<${tag}>${esc(s)}</${tag}>`).join('');
  function table(headers,rows){return `<div class="table-wrap" tabindex="0"><table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
  function metrics(items){return `<div class="metrics">${items.map(([label,value])=>`<div class="metric"><b>${esc(value)}</b><span>${esc(label)}</span></div>`).join('')}</div>`;}
  const resultNote=(s,w=false)=>`<p class="result-note${w?' warning':''}">${esc(s)}</p>`;
  function colLabel(key){const c=dataset.columns.find(c=>c.key===key);return c?`${c.label} (${c.key})`:key;}
  function options(columns,selected){return columns.map(c=>`<option value="${esc(c.key)}"${c.key===selected?' selected':''}>${esc(c.label)} · ${esc(c.key)}</option>`).join('');}
  function unique(key){return [...new Set(dataset.rows.map(r=>r[key]).filter(v=>!missing(v)))];}
  function numericColumns(rank){return dataset.columns.filter(c=>c.type==='numeric'||(rank&&c.type==='ordinal'));}
  function categoryColumns(){return dataset.columns.filter(c=>c.type==='category'||c.type==='ordinal'||(dataset.id==='custom'&&c.type==='numeric'&&unique(c.key).length<=12));}
  function saveNotes(){if(chapter)notes[chapter.id]=Object.fromEntries(noteIds.map(id=>[id,$(id).value]));}
  function chooseChapter(id){
    saveNotes();chapter=LAB_CHAPTERS.find(c=>c.id===id)||LAB_CHAPTERS[2];
    $('chapter-select').value=chapter.id;document.querySelectorAll('#chapters a').forEach(a=>{if(a.getAttribute('href')===`#${chapter.id}`)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    $('chapter-number').textContent=`BÖLÜM ${chapter.id.slice(1)} / 14`;$('chapter-title').textContent=chapter.title;$('page-ref').textContent=`Kitap · s. ${chapter.page}`;$('chapter-question').textContent=chapter.question;
    document.title=`${chapter.id.toUpperCase()} · ${chapter.short} | Temel İstatistik`;
    $('objectives').innerHTML=list(chapter.goals,'span');$('tasks').innerHTML=list(chapter.tasks);$('chapter-hint').textContent=chapter.hint;$('reflection').textContent=chapter.reflection;
    noteIds.forEach(id=>$(id).value=notes[chapter.id]?.[id]||'');
    dataset=LAB_DATA.find(d=>d.id===(chapter.dataset||'uci'));$('dataset').value=dataset.id;
    $('method').value=chapter.method;renderData();renderControls(true);run();
  }
  function renderData(){
    $('data-count').textContent=`${dataset.rows.length} gözlem · ${dataset.columns.length} değişken`;
    $('data-source').textContent=dataset.source;
    if(dataset.url){const a=document.createElement('a');a.href=dataset.url;a.textContent=' Özgün kaynak';a.target='_blank';a.rel='noopener noreferrer';$('data-source').append(a);}
    $('data-preview').innerHTML=table(dataset.columns.map(c=>c.key),dataset.rows.slice(0,8).map(r=>dataset.columns.map(c=>missing(r[c.key])?'Eksik':r[c.key])));
    const typeNames={numeric:'Nicel',ordinal:'Sıralı',category:'Kategorik',id:'Kimlik'};
    $('dictionary').innerHTML=table(['Değişken','Açıklama','Ölçme düzeyi','Değerler / not'],dataset.columns.map(c=>[c.key,c.label,typeNames[c.type],c.note]));
  }
  function selectedOr(columns,wanted,fallback){return columns.some(c=>c.key===wanted)?wanted:columns.some(c=>c.key===fallback)?fallback:columns[0]?.key;}
  function renderControls(reset=false){
    const key=$('method').value,m=methods[key],num=numericColumns(m.rank),cat=categoryColumns();
    const old={x:$('var-x')?.value,y:$('var-y')?.value,group:$('var-group')?.value};
    const defaultX=dataset.id==='book'?(m.kind==='pair'?'on':'son'):'G3',defaultY=dataset.id==='book'?'son':'G1',defaultG=dataset.id==='book'?'grup':'sex';
    const fields=[];
    function field(id,label,cols,fallback){const wanted=reset?chapter[id]:old[id];const selected=selectedOr(cols,wanted,fallback);fields.push(`<label for="var-${id}">${esc(label)}<select id="var-${id}" required>${options(cols,selected)}</select></label>`);}
    if(m.kind==='category')field('x','Kategorik değişken',cat,'sex');
    else if(m.kind==='categories'){field('x','Satır değişkeni',cat,'school');field('y','Sütun değişkeni',cat,'higher');}
    else if(m.kind==='pair'){
      const paired=['paired','wilcoxon'].includes(key);
      field('x',paired?'Birinci ölçüm (önce)':'X değişkeni',num,defaultX);
      field('y',paired?'İkinci ölçüm (sonra)':'Y değişkeni',num,defaultY);
    }else{field('x','Nicel / yanıt değişkeni',num,defaultX);if(m.kind==='group')field('group','Gruplama değişkeni',cat,defaultG);}
    $('variable-controls').innerHTML=fields.join('');$('method-hint').textContent=m.hint;$('assumptions').innerHTML=list(m.assume);
    $('null-label').hidden=key!=='one';$('simulation-controls').hidden=key!=='sampling';
    const valid=!!$('var-x')?.value&&(m.kind!=='pair'&&m.kind!=='categories'||!!$('var-y')?.value)&&(m.kind!=='group'||!!$('var-group')?.value);
    $('analysis-form').querySelector('button[type=submit]').disabled=!valid;
    if(!valid)$('method-hint').textContent='Bu veri setinde seçili yönteme uygun değişken yok. Veri setini veya yöntemi değiştirin.';
    invalidate();
  }
  function invalidate(){last=null;$('results').innerHTML='<p class="empty">Seçimler hazır. Sonuçları görmek için analizi çalıştırın.</p>';$('chart').innerHTML='';$('chart-description').textContent='';$('result-state').textContent='Yeni analiz bekleniyor';$('r-code').textContent='Analiz çalıştırıldığında kod burada görünecek.';$('download-report').disabled=true;$('download-code').disabled=true;}
  function selection(){const m=$('method').value;return {method:m,x:$('var-x')?.value,y:$('var-y')?.value,group:$('var-group')?.value,confidence:Number($('confidence').value),mu:$('null-value').valueAsNumber,n:Number($('sample-size').value),seed:$('seed').valueAsNumber};}
  function prepare(c){
    const kind=methods[c.method].kind,keys=[c.x,...(kind==='pair'||kind==='categories'?[c.y]:[]),...(kind==='group'?[c.group]:[])];
    if(keys.some(k=>!k))throw new Error('Analiz için gerekli değişkenleri seçin.');
    if((kind==='pair'||kind==='categories')&&c.x===c.y)throw new Error('İki farklı değişken seçin.');
    if(kind==='group'&&c.x===c.group)throw new Error('Yanıt ve grup değişkeni farklı olmalıdır.');
    const rows=dataset.rows.filter(r=>keys.every(k=>!missing(r[k]))),x=rows.map(r=>r[c.x]),y=c.y?rows.map(r=>r[c.y]):null;
    if(!rows.length)throw new Error('Seçilen değişkenler için ortak geçerli gözlem yok.');
    const levels=kind==='group'?[...new Set(rows.map(r=>String(r[c.group])))].sort((a,b)=>a.localeCompare(b,'tr',{numeric:true})):[];
    if(levels.length>12)throw new Error('En çok 12 gruplu bir değişken seçin.');
    if(['welch','mann'].includes(c.method)&&levels.length!==2)throw new Error('Bu test tam olarak iki grup gerektirir. Başka bir gruplama değişkeni seçin.');
    const groups=levels.map(g=>rows.filter(r=>String(r[c.group])===g).map(r=>r[c.x]));
    return {rows,x,y,levels,groups,excluded:dataset.rows.length-rows.length};
  }
  function run(){
    try{
      const c=selection(),p=prepare(c),x=p.x,y=p.y,confidence=c.confidence,alpha=1-confidence;let d={},body='',chart='',chartDesc='',report='';
      const conclusion=v=>v<alpha?`Seçilen α = ${fmt(alpha,2)} düzeyinde H₀ reddedilir.`:`Seçilen α = ${fmt(alpha,2)} düzeyinde H₀ reddedilemez; bu sonuç eşitliği kanıtlamaz.`;
      const groupTable=()=>table(['Grup','n','Ortalama','SS','Medyan'],p.groups.map((g,i)=>{const s=S.desc(g);return [p.levels[i],s.n,fmt(s.mean),fmt(s.sd),fmt(s.median)];}));
      switch(c.method){
        case 'frequency':{
          const counts=new Map();x.forEach(v=>counts.set(String(v),(counts.get(String(v))||0)+1));
          if(counts.size>30)throw new Error('Frekans tablosu için en çok 30 kategorili bir değişken seçin.');
          const rows=[...counts].sort((a,b)=>a[0].localeCompare(b[0],'tr',{numeric:true}));d={n:x.length,categories:rows.length,counts:rows};
          report=`${colLabel(c.x)}: ${x.length} geçerli gözlem, ${rows.length} kategori.\n`+rows.map(([k,n])=>`${k}: n=${n}, %${fmt(n/x.length*100,1)}`).join('\n');
          body=metrics([['Geçerli gözlem',x.length],['Kategori',rows.length],['Eksik',p.excluded]])+table(['Kategori','Frekans','Geçerli yüzde'],rows.map(([k,n])=>[k,n,`%${fmt(n/x.length*100,1)}`]));chart=barChart(rows.map(r=>r[0]),rows.map(r=>r[1]),'Frekans');chartDesc='Her sütun bir kategorinin gözlem sayısını gösterir.';break;}
        case 'describe':case 'ci':case 'zscore':{
          d=c.method==='ci'?S.ci(x,confidence):S.desc(x);
          if(c.method==='zscore'&&!(d.sd>0))throw new Error('z puanı için en az iki gözlem ve sıfırdan büyük standart sapma gerekir.');
          report=`${colLabel(c.x)}: n=${d.n}, ortalama=${fmt(d.mean)}, SS=${fmt(d.sd)}, medyan=${fmt(d.median)}, IQR=${fmt(d.iqr)}.`;
          body=metrics([['Ortalama',fmt(d.mean)],['Standart sapma',fmt(d.sd)],['Geçerli n',d.n]])+table(['Ölçü','Değer'],[['Medyan',fmt(d.median)],['Standart hata',fmt(d.se)],['Minimum – maksimum',`${fmt(d.min)} – ${fmt(d.max)}`],['Q1 – Q3',`${fmt(d.q1)} – ${fmt(d.q3)}`],['IQR',fmt(d.iqr)]]);
          if(c.method==='ci'){report+=` %${Math.round(confidence*100)} ortalama GA ${interval(d.lo,d.hi)}.`;body+=resultNote(`Ortalama için %${Math.round(confidence*100)} t güven aralığı: ${interval(d.lo,d.hi)}. sd = ${d.df}. Bu, bireysel gözlemler için bir aralık değildir.`);}
          if(c.method==='zscore')body+=table(['Geçerli sıra','Gözlem','z puanı'],x.slice(0,12).map((v,i)=>[i+1,fmt(v),fmt((v-d.mean)/d.sd)]))+resultNote('İlk 12 geçerli gözlem gösteriliyor. z=(gözlem−ortalama)/örneklem SS.');
          chart=histogram(x,colLabel(c.x));chartDesc='Histogram geçerli gözlemlerin dağılımını gösterir; frekans sütunlarının altında değişkenin ölçeği yer alır.';break;}
        case 'sampling':{
          if(!Number.isInteger(c.seed)||c.seed<0||c.seed>4294967295)throw new Error('Tohum 0–4294967295 arasında bir tam sayı olmalıdır.');
          d=S.sampling(x,c.n,c.seed,500,confidence);report=`Örnek evren ortalaması=${fmt(d.populationMean)}; 500 tekrar; her örnekte n=${c.n}; tohum=${c.seed}; örneklem ortalamalarının ortalaması=${fmt(d.mean)}, ampirik SH=${fmt(d.sd)}, teorik SH=${fmt(d.theoreticalSE)}.`;
          body=metrics([['Veri havuzu ortalaması',fmt(d.populationMean)],['Ortalamaların ortalaması',fmt(d.mean)],['Ortalamaların SS / ampirik SH',fmt(d.sd)]])+resultNote(`Her örnekte n=${c.n}; 500 tekrar; tohum=${c.seed}. Teorik SH=${fmt(d.theoreticalSE)}. Ortalamaların orta %${Math.round(confidence*100)} benzetim aralığı ${interval(d.lo,d.hi)}; tek örnekleme ait güven aralığı değildir.`)+resultNote('Seçim yerine koyarak yapılır. Özgün veri havuzunun daha geniş bir evreni temsil ettiğini göstermez.');chart=histogram(d.means,'Örneklem ortalaması');chartDesc='Bu histogram öğrenci notlarını değil, 500 farklı örneklemin ortalamalarını gösterir.';break;}
        case 'one':case 'paired':case 'welch':{
          d=c.method==='one'?S.one(x,c.mu,confidence):c.method==='paired'?S.paired(x,y,confidence):S.welch(...p.groups,confidence);
          const direction=c.method==='one'?`${c.x} − ${c.mu}`:c.method==='paired'?`${c.y} − ${c.x}`:`${p.levels[0]} − ${p.levels[1]}`;
          report=`${methods[c.method].name}; fark yönü ${direction}; ortalama farkı=${fmt(d.difference)}, %${Math.round(confidence*100)} GA ${interval(d.lo,d.hi)}, t(${fmt(d.df)})=${fmt(d.t)}, ${ptxt(d.p)}, ${c.method==='paired'?'Cohen dz':'Cohen d'}=${fmt(d.d)}. ${conclusion(d.p)}`;
          body=metrics([['Ortalama farkı',fmt(d.difference)],['t istatistiği',fmt(d.t)],['p değeri',d.p<.001?'< 0,001':fmt(d.p)]])+resultNote(`Fark yönü: ${direction}. %${Math.round(confidence*100)} fark GA ${interval(d.lo,d.hi)}. ${c.method==='paired'?'Cohen dz':'Cohen d'} = ${fmt(d.d)}.`);
          if(c.method==='welch'){body+=groupTable()+resultNote('Cohen d, havuzlanmış grup içi standart sapmayla hesaplanır; test istatistiği Welch standart hatasını kullanır.');chart=groupPlot(p.groups,p.levels,colLabel(c.x));}
          else if(c.method==='paired'){chart=histogram(d.differences,`${c.y} − ${c.x}`);body+=table(['Birinci ölçüm ort.','İkinci ölçüm ort.','Eşleşen n'],[[fmt(d.before),fmt(d.after),d.n]]);}
          else chart=histogram(x,colLabel(c.x));
          chartDesc=c.method==='paired'?'Farkların dağılımını inceleyin. Eşleştirilmiş testin normallik varsayımı bu farklarla ilgilidir.':c.method==='welch'?'Her nokta bir gözlem; koyu çizgi grup ortalamasıdır. Noktalar görünürlük için yatay kaydırılmıştır.':'Ham dağılım ve aykırı değerleri test sonucuyla birlikte inceleyin.';
          body+=`<p class="result-text">${esc(conclusion(d.p))}</p>`;break;}
        case 'anova':case 'kruskal':{
          d=c.method==='anova'?S.anova(p.groups):S.kruskal(p.groups);
          const a=c.method==='anova';report=a?`F(${d.df1}, ${d.df2})=${fmt(d.f)}, ${ptxt(d.p)}, eta-kare=${fmt(d.eta2)}.`:`H(${d.df})=${fmt(d.h)}, ${ptxt(d.p)}, epsilon-kare=${fmt(d.epsilon2)} (bağ düzeltmeli asimptotik test).`;
          report+=` ${conclusion(d.p)} Genel test hangi grupların farklı olduğunu göstermez.`;
          body=metrics([[a?'F istatistiği':'H istatistiği',fmt(a?d.f:d.h)],['p değeri',d.p<.001?'< 0,001':fmt(d.p)],[a?'Eta-kare':'Epsilon-kare',fmt(a?d.eta2:d.epsilon2)]])+groupTable()+resultNote('Genel testten hangi grupların farklı olduğu çıkarılamaz. Gerekirse önceden planlanan karşılaştırmalar veya düzeltilmiş post-hoc analiz yapılır.');
          if(!a)body+=resultNote('Bağ düzeltmeli ki-kare yaklaşımı kullanılır. Özellikle grup n<5 olduğunda yaklaşım zayıflayabilir.',p.groups.some(g=>g.length<5));chart=groupPlot(p.groups,p.levels,colLabel(c.x));chartDesc='Ham gözlemler ve grup ortalamaları. Sıra testinin hedefi yalnız ortalama karşılaştırması değildir.';break;}
        case 'pearson':case 'spearman':case 'regression':{
          d=c.method==='pearson'?S.correlation(x,y,confidence):c.method==='spearman'?S.spearman(x,y):S.regression(x,y,confidence);
          if(c.method==='regression'){
            report=`${c.y} = ${fmt(d.intercept)} + (${fmt(d.slope)}) × ${c.x}. Eğim %${Math.round(confidence*100)} GA ${interval(d.lo,d.hi)}, R²=${fmt(d.r2)}, ${ptxt(d.p)}, n=${d.n}.`;
            body=metrics([['Eğim',fmt(d.slope)],['R²',fmt(d.r2)],['Eğim p değeri',d.p<.001?'< 0,001':fmt(d.p)]])+resultNote(report);chart=scatter(x,y,c.x,c.y,d)+scatter(d.predicted,d.residuals,'Uydurulan Y','Artık',null,true);chartDesc='Üstte doğrusal uyum; altta artık–uydurulan değer grafiği. Artıklarda eğri veya huni biçimini kontrol edin.';
            if(d.residualSD<1e-10)body+=resultNote('Neredeyse kusursuz doğrusal uyum var. Bu sınır durumda hata varyansına dayalı çıkarım dejenere olur.',true);
          }else{
            const sp=c.method==='spearman';report=`${sp?'Spearman rho':'Pearson r'}=${fmt(d.r)}, ${ptxt(d.p)}, n=${d.n}.`;
            if(!sp&&d.lo!==null)report+=` Fisher z %${Math.round(confidence*100)} GA ${interval(d.lo,d.hi)}.`;
            body=metrics([[sp?'Spearman rho':'Pearson r',fmt(d.r)],['p değeri',d.p<.001?'< 0,001':fmt(d.p)],['Eşleşen n',d.n]])+resultNote(report);
            if(sp)body+=resultNote('p, sıra korelasyonunun t yaklaşımıyla hesaplanır; bağlar ortalama sıralarla işlenir. Bu sürüm Spearman güven aralığı üretmez. Küçük örnekte permütasyon tercih edilebilir.',d.n<30);
            if(!sp&&d.lo===null)body+=resultNote('Fisher z güven aralığı için en az 4 eşleşen gözlem gerekir.',true);
            chart=scatter(x,y,c.x,c.y);chartDesc='Her nokta aynı satırdaki iki ölçümü gösterir. Örtüşen noktalar koyulaşabilir.';
          }
          body+=resultNote('İlişki veya yordama gücü, nedensel etkiyi tek başına göstermez.');break;}
        case 'chi':{
          const a=[...new Set(x.map(String))].sort(),b=[...new Set(y.map(String))].sort();
          if(a.length>12||b.length>12)throw new Error('Çapraz tablo için her değişkende en çok 12 kategori seçin.');
          const t=a.map(aa=>b.map(bb=>p.rows.filter(r=>String(r[c.x])===aa&&String(r[c.y])===bb).length));d=S.chi(t);d.categoriesA=a;d.categoriesB=b;d.observed=t;
          report=`Pearson χ²(${d.df})=${fmt(d.x2)}, ${ptxt(d.p)}, Cramér V=${fmt(d.v)}, n=${d.n}. Beklenen minimum=${fmt(d.minExpected)}; 5’in altında ${d.small}/${a.length*b.length} hücre. Yates düzeltmesi yok.`;
          body=metrics([['χ²',fmt(d.x2)],['p değeri',d.p<.001?'< 0,001':fmt(d.p)],['Cramér V',fmt(d.v)]])+table([`${c.x} / ${c.y}`,...b,'Toplam'],t.map((r,i)=>[a[i],...r.map(v=>`${v} (%${fmt(100*v/d.rowTotals[i],1)})`),d.rowTotals[i]]))+resultNote('Parantez içindeki değerler satır yüzdesidir.')+table(['Beklenen frekans',...b],d.expected.map((r,i)=>[a[i],...r.map(v=>fmt(v,2))]));
          if(d.small)body+=resultNote(`Beklenen frekansı 5’ten küçük ${d.small} hücre var. ${d.unreliable?'Ki-kare yaklaşımına güven sınırlıdır; uygun exact veya benzetim testi gerekir.':'Küçük hücreleri ve yaklaşımın uygunluğunu değerlendirin.'}`,true);
          chart='';chartDesc='';break;}
        case 'mann':case 'wilcoxon':{
          const paired=c.method==='wilcoxon';d=paired?S.wilcoxon(x,y):S.mann(...p.groups);
          report=`${methods[c.method].name}: ${paired?'W(min)':'U(ilk grup)'}=${fmt(paired?d.w:d.u)}, ${ptxt(d.p)}, sıra-biserial etki=${fmt(d.effect)}. Bağ ve 0,5 süreklilik düzeltmeli asimptotik p.`;
          body=metrics([[paired?'W (küçük sıra toplamı)':'U (ilk grup)',fmt(paired?d.w:d.u)],['p değeri',d.p<.001?'< 0,001':fmt(d.p)],['Sıra-biserial etki',fmt(d.effect)]])+resultNote(report);
          if(paired){body+=resultNote(`Fark: ${c.y} − ${c.x}. ${d.total} eşleşmenin ${d.zeros} tanesinde fark sıfırdır; ${d.n} sıfır olmayan fark kullanıldı. Sayısal yuvarlama için farklar 12 anlamlı basamağa yuvarlanır.`);chart=histogram(y.map((v,i)=>v-x[i]),`${c.y} − ${c.x}`);}else{body+=groupTable()+resultNote(`Pozitif etki ${p.levels[0]} grubunda daha yüksek sıraları gösterir.`);chart=groupPlot(p.groups,p.levels,colLabel(c.x));}
          if((paired?d.n:Math.min(d.n1,d.n2))<20)body+=resultNote('Küçük örneklem: gösterilen p bir yaklaşımdır. Exact veya permütasyon yöntemiyle kontrol edin.',true);
          chartDesc='Dağılım şekilleri ve farkları sonuçla birlikte inceleyin.';break;}
      }
      if(p.levels.length)report+='\n\nGrup özetleri:\n'+p.groups.map((g,i)=>{const s=S.desc(g);return `${p.levels[i]}: n=${s.n}, ortalama=${fmt(s.mean)}, SS=${fmt(s.sd)}, medyan=${fmt(s.median)}`;}).join('\n');
      if(c.method==='chi')report+='\n\nGözlenen frekanslar (sütunlar: '+d.categoriesB.join(', ')+'):\n'+d.observed.map((r,i)=>d.categoriesA[i]+': '+r.join(', ')).join('\n')+(d.unreliable?'\nSeyrek hücreler nedeniyle ki-kare yaklaşımı sınırlıdır; exact/benzetim testi gerekir.':'');
      if(c.method==='wilcoxon')report+=`\nFark yönü ${c.y}−${c.x}; ${d.zeros} sıfır fark çıkarıldı, ${d.n} sıfır olmayan fark kullanıldı.`;
      if(c.method==='mann')report+=`\nPozitif etki ${p.levels[0]} grubunda daha yüksek sıraları gösterir.`;
      body+=resultNote(`Veri: ${dataset.short}. Analizde ${p.rows.length} ortak geçerli satır; seçili değişkenlerde eksik olduğu için çıkarılan ${p.excluded} satır. Eksik değerler doldurulmaz.`);
      if(dataset.id==='uci'&&!['frequency','describe','zscore','sampling'].includes(c.method))body+=resultNote('UCI verisi iki okuldan gözlemsel kayıtlardır. Buradaki çıkarım basit bağımsız gözlem varsayımını gösteren bir ders uygulamasıdır; okul kümelenmesini modellemez.');
      last={config:c,result:d,report,chapter:chapter.id,chapterTitle:chapter.title,dataName:dataset.short,source:dataset.source,sourceURL:dataset.url,valid:p.rows.length,excluded:p.excluded,levels:p.levels,created:new Date().toISOString()};
      $('results').innerHTML=body;$('chart').innerHTML=chart;$('chart-description').textContent=chartDesc;$('result-state').textContent='Analiz tamamlandı';$('r-code').textContent=rCode(last);$('download-report').disabled=false;$('download-code').disabled=false;
    }catch(e){last=null;$('results').innerHTML=`<p class="error-text" role="alert">${esc(e.message)}</p>`;$('chart').innerHTML='';$('chart-description').textContent='';$('result-state').textContent='Seçimleri kontrol edin';$('r-code').textContent='Geçerli bir analizden sonra kod üretilecektir.';$('download-report').disabled=true;$('download-code').disabled=true;}
  }
  function chartFrame(content,xLabel,yLabel,title){return `<svg viewBox="0 0 600 285" role="img" aria-label="${esc(title)}"><line x1="54" y1="236" x2="580" y2="236" stroke="#acbdb4"/><line x1="54" y1="20" x2="54" y2="236" stroke="#acbdb4"/>${content}<text x="316" y="277" text-anchor="middle">${esc(xLabel)}</text><text x="15" y="130" transform="rotate(-90 15 130)" text-anchor="middle">${esc(yLabel)}</text></svg>`;}
  function barChart(labels,counts,label){const max=Math.max(...counts,1),width=516/labels.length;let content='';counts.forEach((v,i)=>{const h=v/max*195;content+=`<rect x="${59+i*width}" y="${236-h}" width="${Math.max(2,width-8)}" height="${h}" rx="2" fill="#428279"/><text x="${59+i*width+(width-8)/2}" y="${230-h}" text-anchor="middle">${v}</text>`;if(labels.length<=12)content+=`<text x="${59+i*width+width/2}" y="252" text-anchor="middle">${esc(String(labels[i]).slice(0,12))}</text>`;});return chartFrame(content,'Kategori',label,'Kategori frekansları');}
  function histogram(x,label){const min=Math.min(...x),max=Math.max(...x),bins=min===max?1:Math.min(14,Math.max(4,Math.ceil(Math.sqrt(x.length)))),width=max===min?1:(max-min)/bins,counts=Array(bins).fill(0);x.forEach(v=>counts[Math.min(bins-1,Math.floor((v-min)/width))]++);const ymax=Math.max(...counts);let content='';counts.forEach((v,i)=>{const w=516/bins,h=v/ymax*195;content+=`<rect x="${59+i*w}" y="${236-h}" width="${w-2}" height="${h}" fill="#428279"/>`;});[0,.5,1].forEach(f=>{content+=`<text x="${54+f*526}" y="253" text-anchor="middle">${fmt(min+f*(max-min),1)}</text><text x="47" y="${240-f*195}" text-anchor="end">${Math.round(ymax*f)}</text>`;});return chartFrame(content,label,'Frekans',`${label} histogramı; ${x.length} gözlem`);}
  function scatter(x,y,lx,ly,line=null,zero=false){const minX=Math.min(...x),maxX=Math.max(...x),minY=Math.min(...y,zero?0:Infinity),maxY=Math.max(...y,zero?0:-Infinity),sx=v=>54+(v-minX)/(maxX-minX||1)*526,sy=v=>231-(v-minY)/(maxY-minY||1)*201;let content='';[0,.5,1].forEach(f=>{content+=`<text x="${54+f*526}" y="251" text-anchor="middle">${fmt(minX+f*(maxX-minX),1)}</text><text x="47" y="${235-f*201}" text-anchor="end">${fmt(minY+f*(maxY-minY),1)}</text>`;});if(zero)content+=`<line x1="54" y1="${sy(0)}" x2="580" y2="${sy(0)}" stroke="#ac7944" stroke-dasharray="4 4"/>`;for(let i=0;i<x.length;i++)content+=`<circle cx="${sx(x[i])}" cy="${sy(y[i])}" r="${x.length>500?2:3.3}" fill="#24796d" opacity=".43"/>`;if(line)content+=`<line x1="${sx(minX)}" y1="${sy(line.intercept+line.slope*minX)}" x2="${sx(maxX)}" y2="${sy(line.intercept+line.slope*maxX)}" stroke="#a66d31" stroke-width="2.5"/>`;return chartFrame(content,lx,ly,`${ly} ile ${lx} saçılım grafiği`);}
  function groupPlot(groups,labels,label){const all=groups.flat(),min=Math.min(...all),max=Math.max(...all),sy=v=>229-(v-min)/(max-min||1)*198,w=520/groups.length;let content='';groups.forEach((g,k)=>{const cx=58+(k+.5)*w;g.forEach((v,i)=>{const jitter=(((i*37)%101)/100-.5)*Math.min(48,w*.6);content+=`<circle cx="${cx+jitter}" cy="${sy(v)}" r="3" fill="#24796d" opacity=".35"/>`;});content+=`<line x1="${cx-20}" x2="${cx+20}" y1="${sy(S.mean(g))}" y2="${sy(S.mean(g))}" stroke="#173e48" stroke-width="3"/><text x="${cx}" y="253" text-anchor="middle">${esc(String(labels[k]).slice(0,12))}</text>`;});[0,.5,1].forEach(f=>content+=`<text x="47" y="${233-f*198}" text-anchor="end">${fmt(min+f*(max-min),1)}</text>`);return chartFrame(content,'Grup',label,'Gruplara göre ham gözlemler ve ortalamalar');}
  function csvText(){const quote=v=>`"${String(v??'').replace(/"/g,'""')}"`;return '\uFEFF'+[dataset.columns.map(c=>quote(c.key)).join(','),...dataset.rows.map(r=>dataset.columns.map(c=>quote(r[c.key])).join(','))].join('\r\n');}
  function download(text,name,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function rCode(s){
    const c=s.config,q=JSON.stringify,m=c.method,keys=[c.x,...(methods[m].kind==='pair'||methods[m].kind==='categories'?[c.y]:[]),...(methods[m].kind==='group'?[c.group]:[])];
    let code='# Temel İstatistik öğrenci laboratuvarı\n# '+s.dataName+'\n# Kaynak: '+s.sourceURL+'\n'+'df <- read.csv("veri.csv", fileEncoding="UTF-8-BOM", check.names=FALSE, stringsAsFactors=FALSE)\n';
    code+=`d <- df[complete.cases(df[, c(${keys.map(q).join(', ')}), drop=FALSE]), , drop=FALSE]\nx <- d[[${q(c.x)}]]\n`;
    if(c.y)code+=`y <- d[[${q(c.y)}]]\n`;
    if(c.group)code+=`g <- factor(d[[${q(c.group)}]], levels=c(${s.levels.map(q).join(', ')}))\n`;
    const codes={
      frequency:'table(x)\nprop.table(table(x)) * 100',
      describe:'summary(x)\nsd(x)\nsd(x)/sqrt(length(x))\nquantile(x, c(.25,.5,.75), type=7)\nhist(x)',
      zscore:'z <- (x-mean(x))/sd(x)\nhead(data.frame(x,z),12)\nhist(x)',
      ci:`t.test(x, conf.level=${c.confidence})$conf.int`,
      one:`t.test(x, mu=${c.mu}, alternative="two.sided", conf.level=${c.confidence})\n(mean(x)-${c.mu})/sd(x) # Cohen d`,
      paired:`t.test(y, x, paired=TRUE, alternative="two.sided", conf.level=${c.confidence})\nmean(y-x)/sd(y-x) # Cohen dz; fark y-x`,
      welch:`t.test(x ~ g, var.equal=FALSE, alternative="two.sided", conf.level=${c.confidence})\na <- x[g==levels(g)[1]]; b <- x[g==levels(g)[2]]\nsp <- sqrt(((length(a)-1)*var(a)+(length(b)-1)*var(b))/(length(a)+length(b)-2))\n(mean(a)-mean(b))/sp # Cohen d`,
      anova:'fit <- aov(x ~ g)\nsummary(fit)\nss <- summary(fit)[[1]][["Sum Sq"]]\nss[1]/sum(ss) # eta-kare\n# Varsayımlar uygunsa: TukeyHSD(fit)\n# Varyans eşit değilse: oneway.test(x ~ g, var.equal=FALSE)',
      pearson:`cor.test(x, y, method="pearson", conf.level=${c.confidence})\nplot(x,y)`,
      spearman:'cor.test(x, y, method="spearman", exact=FALSE)\nplot(x,y)',
      regression:`fit <- lm(y ~ x)\nsummary(fit)\nconfint(fit, level=${c.confidence})\nplot(x,y); abline(fit)\nplot(fitted(fit),resid(fit)); abline(h=0,lty=2)`,
      chi:'tab <- table(x,y)\ntab\nprop.table(tab,1) * 100\nz <- chisq.test(tab,correct=FALSE)\nz\nz$expected\nsqrt(as.numeric(z$statistic)/(sum(tab)*min(nrow(tab)-1,ncol(tab)-1))) # Cramér V\n# Seyrek 2x2 tablo için: fisher.test(tab)',
      mann:'wilcox.test(x ~ g, exact=FALSE, correct=TRUE) # R W = ilk grubun U değeri',
      wilcoxon:'delta <- signif(y-x,12)\nwilcox.test(delta, mu=0, exact=FALSE, correct=TRUE)\n# R pozitif sıra toplamı V verir; tarayıcı min(V,negatif toplam) verir.\n# İki gösterimin çift yönlü p değerleri eşdeğerdir.',
      kruskal:'kruskal.test(x ~ g)',
      sampling:`set.seed(${c.seed})\nmeans <- replicate(500, mean(sample(x, ${c.n}, replace=TRUE)))\nc(havuz_ortalamasi=mean(x), ortalamalar_ortalamasi=mean(means), ampirik_SH=sd(means))\nhist(means)\n# R ile tarayıcının rassal sayı üreteçleri farklıdır; aynı tohum birebir aynı örnekleri üretmez.`
    };return code+'\n'+codes[m]+'\n';
  }
  $('chapters').innerHTML=LAB_CHAPTERS.map(c=>`<a href="#${c.id}"><span>${c.id.slice(1)}</span>${esc(c.short)}</a>`).join('');
  $('chapter-select').innerHTML=LAB_CHAPTERS.map(c=>`<option value="${c.id}">${c.id.slice(1)} · ${esc(c.short)}</option>`).join('');
  $('dataset').innerHTML=LAB_DATA.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('');
  $('method').innerHTML=Object.entries(methods).map(([id,m])=>`<option value="${id}">${esc(m.name)}</option>`).join('');
  $('chapter-select').addEventListener('change',()=>{location.hash=$('chapter-select').value;});
  window.addEventListener('hashchange',()=>chooseChapter(location.hash.slice(1)));
  $('dataset').addEventListener('change',()=>{dataset=LAB_DATA.find(d=>d.id===$('dataset').value);renderData();renderControls();$('upload-status').textContent='';});
  $('method').addEventListener('change',()=>renderControls());
  $('analysis-form').addEventListener('change',e=>{if(e.target.id!=='method')invalidate();});
  $('analysis-form').addEventListener('input',e=>{if(e.target.tagName==='INPUT')invalidate();});
  $('analysis-form').addEventListener('submit',e=>{e.preventDefault();run();});
  $('csv-file').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    try{if(file.size>2*1024*1024)throw new Error('Dosya 2 MB sınırını aşıyor.');
      const parsed=S.parseCSV(await file.text());
      if(parsed.columns.some(c=>c.key.includes('\uFFFD')))throw new Error('Kodlama okunamadı. Dosyayı UTF-8 CSV olarak kaydedin.');
      const custom={id:'custom',name:`Kendi dosyanız · ${file.name}`,short:file.name,source:'Kullanıcının yerel CSV dosyası. Kaynak, ölçme düzeyleri, eksik kodları ve örnekleme tasarımını kendiniz doğrulayın. Boş, NA, N/A, null ve NaN alanlar eksik sayılır; 0 ve 999 otomatik eksik sayılmaz.',url:'',columns:parsed.columns,rows:parsed.rows};
      const i=LAB_DATA.findIndex(d=>d.id==='custom');if(i>=0)LAB_DATA[i]=custom;else LAB_DATA.push(custom);
      $('dataset').innerHTML=LAB_DATA.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('');dataset=custom;$('dataset').value='custom';renderData();renderControls();$('upload-status').className='feedback';$('upload-status').textContent=`${parsed.rows.length} satır açıldı. Sözlükteki ölçme düzeylerini kontrol edip yönteminizi seçin.`;
    }catch(err){$('upload-status').className='feedback error';$('upload-status').textContent=err.message;}finally{e.target.value='';}
  });
  $('download-data').addEventListener('click',()=>download(csvText(),'veri.csv','text/csv;charset=utf-8'));
  $('download-code').addEventListener('click',()=>{if(last)download(rCode(last),'analiz.R','text/plain;charset=utf-8');});
  $('download-report').addEventListener('click',()=>{
    if(!last)return;saveNotes();const c=last.config;
    const content=`# Temel İstatistik · Öğrenci çalışma raporu\n\n## ${last.chapter.toUpperCase()} — ${last.chapterTitle}\n\nTarih (UTC): ${last.created}\n\nVeri: ${last.dataName}\n\nKaynak: ${last.source}\n${last.sourceURL?'\n'+last.sourceURL+'\n':''}\n## Analiz kaydı\n\nYöntem: ${methods[c.method].name}\n\nDeğişkenler: ${[c.x,c.y,c.group].filter(Boolean).join(', ')}\n\nGeçerli satır: ${last.valid}; eksik nedeniyle çıkarılan: ${last.excluded}\n\nGüven düzeyi: %${Math.round(c.confidence*100)}; testler çift yönlü.\n\n${last.report}\n\n## Araştırma sorum ve yöntem seçimim\n\n${$('research-question').value||'(Öğrenci tarafından doldurulacak.)'}\n\n## Bulgum ve yorumum\n\n${$('interpretation').value||'(Öğrenci tarafından doldurulacak.)'}\n\n## Varsayımlar ve sınırlılıklar\n\n${$('limitations').value||'(Öğrenci tarafından doldurulacak.)'}\n\n### Kontrol edilmesi gereken koşullar\n\n${methods[c.method].assume.map(s=>'- '+s).join('\n')}\n\nBu çıktı varsayımların otomatik doğrulandığı anlamına gelmez. Sıra testlerindeki p değerleri asimptotiktir. Bulgular veri üretimi ve örnekleme tasarımı bağlamında yorumlanmalıdır.\n\n## R ile yeniden üretim\n\n\`\`\`r\n${rCode(last)}\`\`\`\n`;
    download(content,`${last.chapter}-calisma-raporu.md`,'text/markdown;charset=utf-8');
  });
  chooseChapter(location.hash.slice(1)||'b03');
})();

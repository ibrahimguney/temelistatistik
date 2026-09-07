/* Statistical engine. Distribution functions: locally bundled jStat 1.9.6 (MIT).
 * Two-sided tests; sample variance uses n-1. Reference checks: tests/validate.py.
 */
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./vendor/jstat.min.js').jStat:root.jStat);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.LabStats=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(j){
  'use strict';
  function check(ok,message){if(!ok)throw new Error(message);}
  const sum=a=>a.reduce((s,x)=>s+x,0);
  const mean=a=>sum(a)/a.length;
  const clamp=p=>Math.max(0,Math.min(1,p));
  function values(a,min=2){check(a.length>=min,`Bu analiz için en az ${min} geçerli gözlem gerekir.`);check(a.every(Number.isFinite),'Analize yalnız sonlu sayısal değerler girebilir.');}
  function quantile(a,p){check(a.length>0,'Gözlem bulunamadı.');const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,k=Math.floor(i);return s[k]+(s[Math.min(k+1,s.length-1)]-s[k])*(i-k);}
  function variance(a){const m=mean(a);return sum(a.map(x=>(x-m)**2))/(a.length-1);}
  function desc(a){values(a,1);const n=a.length,m=mean(a),v=n>1?variance(a):null;return {n,mean:m,median:quantile(a,.5),sd:v===null?null:Math.sqrt(v),se:v===null?null:Math.sqrt(v/n),min:Math.min(...a),max:Math.max(...a),q1:quantile(a,.25),q3:quantile(a,.75),iqr:quantile(a,.75)-quantile(a,.25)};}
  function level(c){check(c>0&&c<1,'Güven düzeyi 0 ile 1 arasında olmalıdır.');}
  const tp=(t,df)=>clamp(2*j.studentt.cdf(-Math.abs(t),df));
  const fp=(f,d1,d2)=>clamp(j.ibeta(d2/(d2+d1*f),d2/2,d1/2));
  function ci(a,c=.95){values(a);level(c);const d=desc(a);check(d.sd>0,'Değişkenin varyansı sıfır; belirsizlik hesabı için değişken gözlemler gerekir.');const t=j.studentt.inv((1+c)/2,d.n-1);return {...d,df:d.n-1,lo:d.mean-t*d.se,hi:d.mean+t*d.se};}
  function one(a,mu=0,c=.95){check(Number.isFinite(mu),'H₀ ortalaması geçerli bir sayı olmalıdır.');const d=ci(a,c),difference=d.mean-mu,t=difference/d.se;return {...d,difference,t,p:tp(t,d.df),d:difference/d.sd,lo:d.lo-mu,hi:d.hi-mu};}
  function paired(x,y,c=.95){check(x.length===y.length,'Eşleştirilmiş ölçümlerin uzunlukları eşit olmalıdır.');values(x);values(y);const d=y.map((v,i)=>v-x[i]);return {...one(d,0,c),before:mean(x),after:mean(y),differences:d};}
  function welch(a,b,c=.95){values(a);values(b);level(c);const A=desc(a),B=desc(b),v1=A.sd**2/A.n,v2=B.sd**2/B.n,se=Math.sqrt(v1+v2);check(se>0,'İki grubun da varyansı sıfır; t testi hesaplanamaz.');const df=(v1+v2)**2/(v1**2/(A.n-1)+v2**2/(B.n-1)),difference=A.mean-B.mean,t=difference/se,k=j.studentt.inv((1+c)/2,df),pooled=Math.sqrt(((A.n-1)*A.sd**2+(B.n-1)*B.sd**2)/(A.n+B.n-2));return {a:A,b:B,n:A.n+B.n,difference,se,df,t,p:tp(t,df),lo:difference-k*se,hi:difference+k*se,d:difference/pooled};}
  function anova(groups){check(groups.length>=2,'ANOVA için en az iki grup gerekir.');groups.forEach(g=>values(g));const all=groups.flat(),n=all.length,k=groups.length,m=mean(all),ssb=sum(groups.map(g=>g.length*(mean(g)-m)**2)),ssw=sum(groups.map(g=>(g.length-1)*variance(g)));check(ssw>0,'Grup içi varyans sıfır; F testi hesaplanamaz.');const d1=k-1,d2=n-k,f=(ssb/d1)/(ssw/d2);return {n,k,groups:groups.map(desc),ssb,ssw,df1:d1,df2:d2,f,p:fp(f,d1,d2),eta2:ssb/(ssb+ssw)};}
  function correlation(x,y,c=.95){values(x,3);values(y,3);check(x.length===y.length,'İlişki için eşleşen gözlemler gerekir.');level(c);const n=x.length,mx=mean(x),my=mean(y),sxx=sum(x.map(v=>(v-mx)**2)),syy=sum(y.map(v=>(v-my)**2));check(sxx>0&&syy>0,'Sabit değişkenle korelasyon hesaplanamaz.');const sxy=sum(x.map((v,i)=>(v-mx)*(y[i]-my))),r=Math.max(-1,Math.min(1,sxy/Math.sqrt(sxx*syy))),df=n-2,t=Math.abs(r)>=1?Math.sign(r)*Infinity:r*Math.sqrt(df/(1-r*r));let lo=null,hi=null;
    if(n>3){if(Math.abs(r)>=1){lo=r;hi=r;}else{const z=Math.atanh(r),margin=j.normal.inv((1+c)/2,0,1)/Math.sqrt(n-3);lo=Math.tanh(z-margin);hi=Math.tanh(z+margin);}}
    return {n,r,r2:r*r,df,t,p:Number.isFinite(t)?tp(t,df):0,lo,hi,mx,my,sxx,syy,sxy};
  }
  function ranks(a){values(a,1);const sorted=a.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v),result=new Array(a.length);let tieTerm=0;for(let start=0;start<sorted.length;){let end=start+1;while(end<sorted.length&&sorted[end].v===sorted[start].v)end++;const rank=(start+1+end)/2,t=end-start;tieTerm+=t**3-t;for(let k=start;k<end;k++)result[sorted[k].i]=rank;start=end;}return {ranks:result,tieTerm};}
  function spearman(x,y){check(x.length===y.length,'İlişki için eşleşen gözlemler gerekir.');const d=correlation(ranks(x).ranks,ranks(y).ranks);return {...d,lo:null,hi:null};}
  function regression(x,y,c=.95){const d=correlation(x,y,c),slope=d.sxy/d.sxx,intercept=d.my-slope*d.mx,predicted=x.map(v=>intercept+slope*v),residuals=y.map((v,i)=>v-predicted[i]),sse=sum(residuals.map(v=>v*v)),mse=sse/d.df,se=Math.sqrt(mse/d.sxx),k=j.studentt.inv((1+c)/2,d.df);return {...d,slope,intercept,se,lo:slope-k*se,hi:slope+k*se,predicted,residuals,residualSD:Math.sqrt(mse)};}
  function chi(table){check(table.length>=2&&table[0].length>=2,'Ki-kare için en az 2×2 dolu kategori gerekir.');const rows=table.length,cols=table[0].length;check(table.every(row=>row.length===cols&&row.every(v=>Number.isInteger(v)&&v>=0)),'Tablo negatif olmayan tam sayı frekansları içermelidir.');const rowTotals=table.map(sum),colTotals=Array.from({length:cols},(_,c)=>sum(table.map(row=>row[c]))),n=sum(rowTotals);check(n>0&&rowTotals.every(v=>v>0)&&colTotals.every(v=>v>0),'Boş satır veya sütun kategorisiyle ki-kare hesaplanamaz.');const expected=table.map((row,r)=>row.map((v,c)=>rowTotals[r]*colTotals[c]/n));let x2=0;table.forEach((row,r)=>row.forEach((v,c)=>x2+=(v-expected[r][c])**2/expected[r][c]));const df=(rows-1)*(cols-1),small=expected.flat().filter(v=>v<5).length,minExpected=Math.min(...expected.flat());return {n,df,x2,p:clamp(1-j.chisquare.cdf(x2,df)),v:Math.sqrt(x2/(n*Math.min(rows-1,cols-1))),expected,rowTotals,colTotals,small,minExpected,unreliable:minExpected<1||small/(rows*cols)>.2};}
  function mann(a,b){values(a);values(b);const n1=a.length,n2=b.length,N=n1+n2,{ranks:r,tieTerm}=ranks([...a,...b]),u=sum(r.slice(0,n1))-n1*(n1+1)/2,mu=n1*n2/2,v=n1*n2/12*(N+1-tieTerm/(N*(N-1)));check(v>0,'Tüm gözlemler eşit; sıra testi hesaplanamaz.');const z=Math.max(0,Math.abs(u-mu)-.5)/Math.sqrt(v);return {n:N,n1,n2,u,z,p:clamp(2*j.normal.cdf(-z,0,1)),effect:2*u/(n1*n2)-1};}
  function wilcoxon(x,y){values(x);values(y);check(x.length===y.length,'Eşleştirilmiş ölçümlerin uzunlukları eşit olmalıdır.');const diff=y.map((v,i)=>Number((v-x[i]).toPrecision(12))),nonzero=diff.filter(v=>v!==0),n=nonzero.length;check(n>=2,'En az iki sıfır olmayan eşleştirilmiş fark gerekir.');const {ranks:r,tieTerm}=ranks(nonzero.map(Math.abs)),plus=sum(r.filter((v,i)=>nonzero[i]>0)),minus=sum(r.filter((v,i)=>nonzero[i]<0)),mu=n*(n+1)/4,v=n*(n+1)*(2*n+1)/24-tieTerm/48;check(v>0,'Sıra varyansı sıfır.');const z=Math.max(0,Math.abs(plus-mu)-.5)/Math.sqrt(v);return {n,total:x.length,zeros:x.length-n,w:Math.min(plus,minus),plus,minus,z,p:clamp(2*j.normal.cdf(-z,0,1)),effect:(plus-minus)/(plus+minus)};}
  function kruskal(groups){check(groups.length>=2,'En az iki grup gerekir.');groups.forEach(g=>values(g,2));const all=groups.flat(),n=all.length,k=groups.length,{ranks:r,tieTerm}=ranks(all),correction=1-tieTerm/(n**3-n);check(correction>0,'Tüm gözlemler eşit; sıra testi hesaplanamaz.');let index=0,s=0;groups.forEach(g=>{const rs=sum(r.slice(index,index+g.length));index+=g.length;s+=rs**2/g.length;});const h=Math.max(0,(12*s/(n*(n+1))-3*(n+1))/correction),df=k-1;return {n,k,h,df,p:clamp(1-j.chisquare.cdf(h,df)),epsilon2:Math.max(0,(h-k+1)/(n-k))};}
  function rng(seed){let a=seed>>>0;return function(){a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
  function sampling(a,n=30,seed=209,reps=500,c=.95){values(a);level(c);check(Number.isInteger(n)&&n>=2&&n<=500,'Örnek büyüklüğü 2–500 arasında tam sayı olmalıdır.');const random=rng(seed),means=[];for(let i=0;i<reps;i++){let total=0;for(let k=0;k<n;k++)total+=a[Math.floor(random()*a.length)];means.push(total/n);}const d=desc(means),mu=mean(a),popSD=Math.sqrt(sum(a.map(v=>(v-mu)**2))/a.length);return {...d,populationN:a.length,populationMean:mu,sampleSize:n,reps,seed,means,theoreticalSE:popSD/Math.sqrt(n),lo:quantile(means,(1-c)/2),hi:quantile(means,(1+c)/2)};}
  function parseCSV(text){
    check(typeof text==='string'&&text.trim(),'CSV dosyası boş.');check(!text.includes('\u0000'),'CSV dosyası düz metin olmalıdır.');
    text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
    let first='',quoted=false;for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){first+='  ';i++;continue;}quoted=!quoted;}if(ch==='\n'&&!quoted)break;first+=quoted?' ':ch;}
    const candidates=[',',';','\t'],delimiter=candidates.sort((a,b)=>first.split(b).length-first.split(a).length)[0];
    const rows=[];let row=[],field='',inQuotes=false,closed=false;
    function finishField(){row.push(field.trim());field='';closed=false;}
    function finishRow(){finishField();if(row.some(v=>v!==''))rows.push(row);row=[];}
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(inQuotes){if(ch==='"'){if(text[i+1]==='"'){field+='"';i++;}else{inQuotes=false;closed=true;}}else field+=ch;continue;}
      if(ch==='"'){check(!field.trim()&&!closed,'CSV içinde hatalı tırnak kullanımı.');inQuotes=true;continue;}
      if(ch===delimiter){finishField();continue;}if(ch==='\n'){finishRow();continue;}
      check(!closed||/\s/.test(ch),'Kapanan tırnaktan sonra beklenmeyen karakter.');if(!closed)field+=ch;
    }
    check(!inQuotes,'CSV içinde kapanmamış tırnak var.');if(field!==''||row.length||closed)finishRow();
    check(rows.length>=2,'CSV başlık ve en az bir veri satırı içermelidir.');const headers=rows.shift();
    check(headers.length>=1&&headers.length<=50,'CSV en çok 50 sütun içerebilir.');check(headers.every(h=>h&&h.length<=100),'Sütun adları boş olamaz ve 100 karakteri geçemez.');check(new Set(headers).size===headers.length,'Sütun adları benzersiz olmalıdır.');
    check(rows.length<=5000,'CSV en çok 5.000 veri satırı içerebilir.');check(rows.every(r=>r.length===headers.length),'CSV satırlarında sütun sayısı tutarsız. Ondalık virgüllü dosyada ayırıcı noktalı virgül olmalıdır.');
    const missing=v=>v===''||/^(na|n\/a|null|nan)$/i.test(v);
    const number=v=>{const s=delimiter===','?v:v.replace(',','.');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s))return NaN;return Number(s);};
    const columns=headers.map((key,i)=>{const present=rows.map(r=>r[i]).filter(v=>!missing(v));const numeric=present.length>0&&present.every(v=>Number.isFinite(number(v)));return {key,label:key,type:numeric?'numeric':'category',note:numeric?'Sayısal olarak algılandı. Ölçme düzeyini doğrulayın; sayısal kategori ve kimlik kodları nicel ölçüm değildir.':'Metin/kategori olarak algılandı.'};});
    const data=rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,missing(r[i])?null:columns[i].type==='numeric'?number(r[i]):r[i]])));
    return {columns,rows:data,delimiter};
  }
  return {sum,mean,variance,quantile,desc,ci,one,paired,welch,anova,correlation,spearman,regression,chi,mann,wilcoxon,kruskal,sampling,parseCSV,ranks};
});

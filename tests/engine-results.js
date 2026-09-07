const S=require('../assets/stats.js');
require('../assets/data.js');
const u=LAB_DATA[0].rows,b=LAB_DATA[1].rows;
const x=u.map(r=>r.G1),y=u.map(r=>r.G3),a=u.filter(r=>r.sex==='F').map(r=>r.G3),z=u.filter(r=>r.sex==='M').map(r=>r.G3);
const groups=[1,2,3,4].map(g=>u.filter(r=>r.studytime===g).map(r=>r.G3));
const school=['GP','MS'],higher=['no','yes'],tab=school.map(s=>higher.map(h=>u.filter(r=>r.school===s&&r.higher===h).length));
const results={describe:S.desc(y),ci:S.ci(y),one:S.one(y,10),paired:S.paired(x,y),welch:S.welch(a,z),anova:S.anova(groups),pearson:S.correlation(x,y),spearman:S.spearman(x,y),regression:S.regression(x,y),chi:S.chi(tab),mann:S.mann(a,z),wilcoxon:S.wilcoxon(x,y),kruskal:S.kruskal(groups),bookPaired:S.paired(b.map(r=>r.on),b.map(r=>r.son)),bookWelch:S.welch(b.slice(0,8).map(r=>r.son),b.slice(8).map(r=>r.son)),bookRegression:S.regression(b.map(r=>r.saat),b.map(r=>r.son))};
process.stdout.write(JSON.stringify(results));

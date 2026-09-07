"""Sayısal doğrulama: SciPy referansları, kitaptaki kontroller ve CSV kenar durumları.
Gereksinim: Python, NumPy, SciPy; Node.js. Çalıştırma: python tests/validate.py
"""
from pathlib import Path
import csv, json, subprocess
import numpy as np
from scipy import stats
ROOT=Path(__file__).resolve().parents[1]
actual=json.loads(subprocess.check_output(['node','tests/engine-results.js'],cwd=ROOT,text=True))
with (ROOT/'veriler/student-mat.csv').open() as f: rows=list(csv.DictReader(f,delimiter=';'))
y=np.array([float(r['G3']) for r in rows]);x=np.array([float(r['G1']) for r in rows])
a=np.array([float(r['G3']) for r in rows if r['sex']=='F']);b=np.array([float(r['G3']) for r in rows if r['sex']=='M'])
groups=[np.array([float(r['G3']) for r in rows if r['studytime']==str(i)]) for i in (1,2,3,4)]
checks=[]
def check(method,key,expected,atol=2e-7):
    value=actual[method][key]
    assert np.isclose(value,expected,rtol=2e-6,atol=atol),(method,key,value,expected)
    checks.append((method,key))
check('describe','mean',np.mean(y));check('describe','sd',np.std(y,ddof=1));check('describe','median',np.median(y))
check('describe','q1',np.quantile(y,.25));check('describe','q3',np.quantile(y,.75))
ci=stats.t.interval(.95,len(y)-1,loc=y.mean(),scale=stats.sem(y))
check('ci','lo',ci[0]);check('ci','hi',ci[1])
for name,test in [('one',stats.ttest_1samp(y,10)),('paired',stats.ttest_rel(y,x)),('welch',stats.ttest_ind(a,b,equal_var=False))]:
    check(name,'t',test.statistic);check(name,'p',test.pvalue,1e-11)
f=stats.f_oneway(*groups);check('anova','f',f.statistic);check('anova','p',f.pvalue,1e-11)
for name,res in [('pearson',stats.pearsonr(x,y)),('spearman',stats.spearmanr(x,y))]:
    check(name,'r',res.statistic);check(name,'p',res.pvalue,1e-11)
r=stats.linregress(x,y);check('regression','slope',r.slope);check('regression','intercept',r.intercept);check('regression','se',r.stderr)
delta=stats.t.ppf(.975,len(x)-2)*r.stderr;check('regression','lo',r.slope-delta);check('regression','hi',r.slope+delta)
tab=[[sum(row['school']==s and row['higher']==h for row in rows) for h in ('no','yes')] for s in ('GP','MS')]
q=stats.chi2_contingency(tab,correction=False);check('chi','x2',q.statistic);check('chi','p',q.pvalue,1e-11)
q=stats.mannwhitneyu(a,b,alternative='two-sided',method='asymptotic',use_continuity=True);check('mann','u',q.statistic);check('mann','p',q.pvalue,1e-11)
q=stats.wilcoxon(y-x,zero_method='wilcox',correction=True,alternative='two-sided',method='approx');check('wilcoxon','w',q.statistic);check('wilcoxon','p',q.pvalue,1e-11)
q=stats.kruskal(*groups);check('kruskal','h',q.statistic);check('kruskal','p',q.pvalue,1e-11)
with (ROOT/'veriler/kitap-b14.csv').open() as f: book=list(csv.DictReader(f))
before=np.array([float(r['on']) for r in book]);after=np.array([float(r['son']) for r in book]);hours=np.array([float(r['saat']) for r in book])
q=stats.ttest_rel(after,before);check('bookPaired','t',q.statistic);check('bookPaired','p',q.pvalue,1e-12);check('bookPaired','difference',5.375)
q=stats.ttest_ind(after[:8],after[8:],equal_var=False);check('bookWelch','t',q.statistic);check('bookWelch','p',q.pvalue,1e-11)
check('bookRegression','slope',stats.linregress(hours,after).slope)
assert after.mean()==59.5
subprocess.run(['node','tests/edge-cases.js'],cwd=ROOT,check=True)
print(f'{len(checks)} sayısal kontrol SciPy ile doğrulandı. Kitap B14 kontrolü başarılı.')

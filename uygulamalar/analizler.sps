* Temel İstatistik — SPSS uygulama başlangıcı.
* Önce çalışma klasörünü kendi proje klasörünüze ayarlayın.
* Örnek: CD 'C:\Users\kullanici\Documents\temelistatistik'.
* Kaynak: veriler/KAYNAKLAR.md. Bu syntax SPSS kurulumunda çalıştırılmalıdır.

GET DATA
 /TYPE=TXT
 /FILE='veriler/student-mat.csv'
 /ENCODING='UTF8'
 /DELCASE=LINE
 /DELIMITERS=";"
 /QUALIFIER='"'
 /ARRANGEMENT=DELIMITED
 /FIRSTCASE=2
 /VARIABLES=
 school A2 sex A1 age F8.0 address A1 famsize A3 Pstatus A1
 Medu F8.0 Fedu F8.0 Mjob A12 Fjob A12 reason A12 guardian A12
 traveltime F8.0 studytime F8.0 failures F8.0
 schoolsup A3 famsup A3 paid A3 activities A3 nursery A3 higher A3
 internet A3 romantic A3 famrel F8.0 freetime F8.0 goout F8.0
 Dalc F8.0 Walc F8.0 health F8.0 absences F8.0
 G1 F8.0 G2 F8.0 G3 F8.0.
DATASET NAME UCI.
VARIABLE LEVEL school sex address famsize Pstatus Mjob Fjob reason guardian
 schoolsup famsup paid activities nursery higher internet romantic (NOMINAL).
VARIABLE LEVEL Medu Fedu traveltime studytime famrel freetime goout Dalc Walc health (ORDINAL).
VARIABLE LEVEL age failures absences G1 G2 G3 (SCALE).
VALUE LABELS studytime 1 '<2 saat' 2 '2-5 saat' 3 '5-10 saat' 4 '>10 saat'.

* B01-B03: sözlük, frekans, betimleme ve grafik.
DISPLAY DICTIONARY.
FREQUENCIES VARIABLES=school sex studytime.
EXAMINE VARIABLES=G3 absences
 /PLOT=BOXPLOT HISTOGRAM NPPLOT
 /STATISTICS=DESCRIPTIVES
 /CINTERVAL=95
 /MISSING=LISTWISE.

* B04: standartlaştırılmış puanları kaydet.
DESCRIPTIVES VARIABLES=G3 /SAVE.

* B07-B08: çift yönlü t testleri.
T-TEST /TESTVAL=10 /VARIABLES=G3 /CRITERIA=CI(.95).
T-TEST PAIRS=G3 WITH G1 (PAIRED) /CRITERIA=CI(.95).
RECODE sex ('F'=1) ('M'=2) INTO sex_n.
VALUE LABELS sex_n 1 'F' 2 'M'.
T-TEST GROUPS=sex_n(1 2) /VARIABLES=G3 /CRITERIA=CI(.95).
* Bağımsız test tablosunda eşit varyans varsayılmayan satır Welch sonucudur.

* B09: ANOVA ve koşullar uygunsa Tukey.
ONEWAY G3 BY studytime
 /STATISTICS DESCRIPTIVES HOMOGENEITY WELCH
 /POSTHOC=TUKEY ALPHA(.05).

* B10-B11: ilişki ve regresyon.
GRAPH /SCATTERPLOT(BIVAR)=G1 WITH G3.
CORRELATIONS /VARIABLES=G1 G3 /PRINT=TWOTAIL /MISSING=PAIRWISE.
NONPAR CORR /VARIABLES=G1 G3 /PRINT=SPEARMAN TWOTAIL /MISSING=PAIRWISE.
REGRESSION /DEPENDENT=G3 /METHOD=ENTER G1
 /STATISTICS=COEFF R ANOVA CI(95)
 /SCATTERPLOT=(*ZRESID,*ZPRED).

* B12: Pearson satırını kullanın, süreklilik düzeltmeli satır farklıdır.
CROSSTABS /TABLES=school BY higher
 /STATISTICS=CHISQ PHI
 /CELLS=COUNT EXPECTED ROW.

* B13: SPSS sürümü ve exact/asimptotik seçenekleri p değerini etkileyebilir.
NPAR TESTS /M-W=G3 BY sex_n(1 2).
NPAR TESTS /WILCOXON=G3 WITH G1 (PAIRED).
NPAR TESTS /K-W=G3 BY studytime(1 4).

* B14: kitap Tablo 14.2, yapay öğretim verisi.
GET DATA /TYPE=TXT /FILE='veriler/kitap-b14.csv'
 /ENCODING='UTF8' /DELCASE=LINE /DELIMITERS="," /QUALIFIER='"'
 /ARRANGEMENT=DELIMITED /FIRSTCASE=2
 /VARIABLES=id F8.0 grup A1 on F8.0 son F8.0 saat F8.0.
DATASET NAME KitapB14.
COMPUTE degisim=son-on.
RECODE grup ('A'=1) ('B'=2) INTO grup_n.
VALUE LABELS grup_n 1 'A' 2 'B'.
EXECUTE.
DESCRIPTIVES VARIABLES=on son saat degisim.
T-TEST PAIRS=son WITH on (PAIRED) /CRITERIA=CI(.95).
T-TEST GROUPS=grup_n(1 2) /VARIABLES=son degisim /CRITERIA=CI(.95).
CORRELATIONS /VARIABLES=saat son /PRINT=TWOTAIL.
REGRESSION /DEPENDENT=son /METHOD=ENTER saat /STATISTICS=COEFF R ANOVA CI(95).

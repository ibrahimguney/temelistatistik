# Temel İstatistik — 14 bölüme eşlik eden R uygulamaları
# Proje kökünü çalışma klasörü yapın. Ek R paketi gerekmez.
# Veri ve lisans: veriler/KAYNAKLAR.md

d <- read.csv("veriler/student-mat.csv", sep=";", stringsAsFactors=FALSE)
stopifnot(nrow(d)==395L, ncol(d)==33L)

# B01 — veri matrisi ve ölçme düzeyi
str(d)
head(d)
table(d$sex, useNA="ifany")
# studytime saat sayısı değil, dört sıralı kategoridir.

# B02 — örnekleme; burada veri havuzu öğretim amaçlı örnek evren
set.seed(209)
basit_ornek <- d[sample.int(nrow(d), 30, replace=FALSE), ]
tabakali_ornek <- do.call(rbind, lapply(split(d,d$school), function(g) {
  g[sample.int(nrow(g), max(1L, round(30*nrow(g)/nrow(d)))), ]
}))
table(tabakali_ornek$school)
# Yuvarlamayla toplam n, hedef 30'dan farklı olabilir.

# B03 — betimleme (G3 içindeki sıfırlar geçerli nottur)
summary(d$G3)
c(ortalama=mean(d$G3), SS=sd(d$G3), SH=sd(d$G3)/sqrt(nrow(d)))
quantile(d$G3,c(.25,.5,.75),type=7)
hist(d$G3,main="Dönem sonu notları",xlab="G3 (0–20)")

# B04 — standart puan; standartlaştırma normallik yaratmaz
d$z_G3 <- (d$G3-mean(d$G3))/sd(d$G3)
head(d[,c("G3","z_G3")])
qqnorm(d$G3); qqline(d$G3)

# B05 — örneklem ortalamaları ve standart hata
set.seed(209)
ortalamalar <- replicate(500,mean(sample(d$G3,30,replace=TRUE)))
c(havuz_ortalamasi=mean(d$G3), ortalamalar_ortalamasi=mean(ortalamalar), ampirik_SH=sd(ortalamalar))
hist(ortalamalar,main="Örneklem ortalamaları",xlab="Ortalama (n=30)")
# R ve tarayıcı rassal sayı üreteçleri farklıdır; sayısal örnekler birebir eşleşmez.

# B06 — ortalama güven aralığı; gözlemler için aralık değildir
t.test(d$G3, conf.level=.95)$conf.int
t.test(d$G3, conf.level=.99)$conf.int

# B07 — tek örneklem t, çift yönlü
t.test(d$G3,mu=10,alternative="two.sided")
(mean(d$G3)-10)/sd(d$G3) # Cohen d

# B08 — eşleştirilmiş ve bağımsız sorular
t.test(d$G3,d$G1,paired=TRUE,alternative="two.sided") # G3−G1
mean(d$G3-d$G1)/sd(d$G3-d$G1) # dz
d$sex <- factor(d$sex,levels=c("F","M"))
t.test(G3 ~ sex,data=d,var.equal=FALSE) # F−M, Welch

# B09 — tek yönlü ANOVA, etki, post-hoc ve Welch alternatifi
d$studytime_group <- factor(d$studytime,levels=1:4)
fit_aov <- aov(G3 ~ studytime_group,data=d)
summary(fit_aov)
ss <- summary(fit_aov)[[1]][["Sum Sq"]]
ss[1]/sum(ss) # eta-kare
# Yalnız tasarım ve varsayımlar uygunsa post-hoc sonucu yorumlayın:
TukeyHSD(fit_aov)
oneway.test(G3 ~ studytime_group,data=d,var.equal=FALSE) # Welch ANOVA

# B10 — ilişki, nedensellik değildir
plot(d$G1,d$G3,xlab="G1",ylab="G3")
cor.test(d$G1,d$G3,method="pearson",conf.level=.95)
cor.test(d$G1,d$G3,method="spearman",exact=FALSE)

# B11 — basit regresyon, belirsizlik ve tanı
fit <- lm(G3 ~ G1,data=d)
summary(fit)
confint(fit)
plot(fitted(fit),resid(fit),xlab="Uydurulan değer",ylab="Artık")
abline(h=0,lty=2)
qqnorm(resid(fit)); qqline(resid(fit))

# B12 — çapraz tablo ve ki-kare
tab <- table(d$school,d$higher)
tab
prop.table(tab,1)*100
chi <- chisq.test(tab,correct=FALSE) # tarayıcı gibi Yates düzeltmesi yok
chi
chi$expected
sqrt(as.numeric(chi$statistic)/(sum(tab)*min(nrow(tab)-1,ncol(tab)-1))) # Cramér V
fisher.test(tab) # 2x2 tablo; özellikle seyrek hücrelerde değerlendirin

# B13 — bağ/süreklilik düzeltmeli asimptotik sıra testleri
wilcox.test(G3 ~ sex,data=d,exact=FALSE,correct=TRUE) # Mann–Whitney
fark <- signif(d$G3-d$G1,12)
wilcox.test(fark,mu=0,exact=FALSE,correct=TRUE) # Wilcoxon; R pozitif sıra toplamını verir
kruskal.test(G3 ~ studytime_group,data=d)
# Dağılım şekilleri farklıysa bunları otomatik medyan testi diye yorumlamayın.

# B14 — kitaptaki 16 gözlemli yapay veri; Tablo 14.2
b <- read.csv("veriler/kitap-b14.csv",stringsAsFactors=FALSE)
b$grup <- factor(b$grup,levels=c("A","B"))
b$degisim <- b$son-b$on
stopifnot(nrow(b)==16L, mean(b$son)==59.5, mean(b$degisim)==5.375)
c(ortalama=mean(b$son),SS=sd(b$son),SH=sd(b$son)/sqrt(nrow(b)))
t.test(b$son)$conf.int
t.test(b$son,b$on,paired=TRUE)
mean(b$degisim)/sd(b$degisim)
t.test(son ~ grup,data=b,var.equal=FALSE)
t.test(degisim ~ grup,data=b,var.equal=FALSE)
cor.test(b$saat,b$son)
fit_b <- lm(son ~ saat,data=b)
summary(fit_b)
confint(fit_b)

# Not: UCI verisinde okul kümelenmesi bu temel örneklerde modellenmez.
# PISA için ağırlık ve örnekleme tasarımı ayrı bir analiz yaklaşımı gerektirir.
sessionInfo()

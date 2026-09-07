# Doğrulama kaydı

Tarih: 7 Eylül 2026. Kapsam: öğrenci laboratuvarının ilk sürümü.

## Tamamlanan kontroller

| Kontrol | Sonuç |
| --- | --- |
| SciPy ile bağımsız sayısal karşılaştırma | 38 kontrol başarılı |
| CSV ve istatistiksel uç durumlar | 18 kontrol başarılı |
| Yerel HTML dosya bağlantıları | 29 bağlantı mevcut dosyaya gidiyor |
| Bölüm girişleri | B01–B14: 14 ayrı index.html mevcut |
| JavaScript sözdizimi | Uygulama, hesaplama, veri ve bölüm dosyaları başarılı |
| Özgün UCI veri kapsamı | 395 satır, 33 sütun; kaynak CSV değiştirilmedi |
| Kitap B14 veri kapsamı | 16 satır; Tablo 14.2 ile eşleşiyor |

Sayısal karşılaştırmalar ortalama, SS, medyan, çeyrekler, t aralığı, tek/eşleştirilmiş/Welch t, ANOVA, Pearson, Spearman, basit regresyon, ki-kare, Mann–Whitney, Wilcoxon ve Kruskal–Wallis hesaplarını kapsar. Gösterilen p değerleri iki yönlüdür. SciPy ve tarayıcıda aynı süreklilik/bağ düzeltmesi seçenekleri karşılaştırılmıştır.

Kenar durumlar: UTF-8 BOM, ondalık virgül, tırnaklı ayırıcı, çok satırlı alan, eksik hücre, gerçek sıfır, tekrarlı başlık, tutarsız sütun sayısı, kapanmamış tırnak, sonlu olmayan sayı, sabit değişken, tek gözlem, eşleştirme uzunluğu, sıfır farklar, bağlı sıralar ve tekrar üretilebilir benzetim.

## Kitap B14 için kontrol değerleri

| Büyüklük | Hesaplanan değer |
| --- | ---: |
| Son-test ortalaması | 59,500000 |
| Son−ön ortalama farkı | 5,375000 |
| Eşleştirilmiş t, sd=15 | 11,152228 |
| Ortalama fark için %95 GA | [4,347713; 6,402287] |
| Cohen dz | 2,788057 |

Özgün `student-mat.csv` SHA-256: `e47f9ee225e1ee6e69b7564e6dac7123e80b8486677fe111f351964cef5dec80`.

## Kontrolün sınırları

- Sayısal ve statik dosya kontrolleri tamamlandı; gerçek tarayıcı/telefon üzerinde görsel veya uçtan uca test yapılmadı.
- R ve SPSS çalışma zamanları bu ortamda bulunmadığından `.R` ve `.sps` dosyaları bu yazılımlarda çalıştırılmadı. Ana tarayıcı hesapları SciPy ile doğrulandı.
- Dış bağlantıların tamamı otomatik taranmadı. UCI kaynak sayfası ve özgün arşiv erişilerek veri edinildi.
- GitHub Pages etkinleştirmesi depo ayarına bağlıdır. Kaynak dosyalarının depoda bulunması, öğrenci adresinin yayınlandığı anlamına gelmez. Yayın adresi ayrıca doğrulanmalıdır.

Yeniden kontrol: `python tests/validate.py` ve `python tests/static_check.py`.

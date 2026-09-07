# Öğretim elemanı rehberi

Bu alan, 14 bölümlük V3 kitap taslağına göre hazırlanmıştır. Bölüm sayfası kitabın teorik anlatımını tekrarlamak yerine öğrenciye karar verme, veri inceleme, hesaplama ve yorumlama görevi verir.

## Ders içinde kullanım

Önerilen 40–50 dakikalık uygulama:

1. **5 dakika:** Soruyu ve beklenen yönü yazdırın; analizden önce hipotez ve yöntem seçimini kaydettirin.
2. **10 dakika:** Veri sözlüğü, ölçek, örnekleme, eksik veri ve grafik kontrolü yaptırın.
3. **15 dakika:** Analizi çalıştırın; uygun bir alternatif yöntem veya farklı güven düzeyiyle karşılaştırın.
4. **10 dakika:** Her öğrenciden bağlamı, etkiyi ve belirsizliği içeren bulgu paragrafı isteyin.
5. **5 dakika:** İki yaygın yanlış yorumu tartışın ve raporu indirtin.

Bu sıralama 14 haftalık resmî takvim veya zorunlu not dağılımı önerisi değildir; kitabın bölüm yapısına uygun etkinlik düzenidir.

## Örnek değerlendirme rubriği

| Ölçüt | Önerilen puan |
| --- | ---: |
| Araştırma sorusu ve hedef büyüklük | 20 |
| Değişken, tasarım ve yöntem gerekçesi | 20 |
| Veri kalitesi ve varsayım incelemesi | 20 |
| Sayısal sonuç, etki ve belirsizlik raporu | 20 |
| PDR bağlamında yorum ve sınırlılık | 20 |

Rubrik bir çalışma ödevine ilişkindir; dersin sınav/final ağırlıklarını değiştirmez. Sayısal cevabı tek başına başarı ölçütü yapmayın.

## Veri kullanımı

UCI dosyası 395 öğrencilik gerçek gözlemsel veridir. İki Portekiz okulundan elde edilmiştir. Türkiye veya PDR evrenine doğrudan genelleme uygun değildir. Basit testler okul kümelenmesini dikkate almaz; ileri tasarım analizi ayrı uygulama gerektirir.

Kitabın B14 örneği 16 gözlemli yapay veridir. Hızlı elle kontrol ve farklı yöntemlerin hedeflerini ayırmak için uygundur. Küçük örneklem ve sıra testlerinin asimptotik hesaplanması öğrenciyle açıkça tartışılmalıdır.

## Hesaplama kapsamı

- Örneklem SS için n−1; çeyrekler için R type=7 doğrusal enterpolasyon.
- t testleri çift yönlü. Bağımsız gruplarda Welch; Cohen d havuzlanmış SS ile. Eşleştirilmiş testte fark ikinci−birinci; etki dz.
- ANOVA klasik tek yönlüdür; eta-kare raporlanır. Tarayıcıda Welch ANOVA ve post-hoc yoktur; R dosyasında örnekler vardır.
- Pearson güven aralığı Fisher z yaklaşımıdır; n<4 ise gösterilmez. Spearman p değeri t yaklaşımıdır, güven aralığı üretilmez.
- Basit regresyonda OLS, eğim t güven aralığı, R² ve artık grafiği. Çoklu regresyon yoktur.
- Ki-kare Pearson testidir; Yates düzeltmesi yoktur. Beklenen frekanslar gösterilir. Fisher exact tarayıcıda yoktur; R örneği vardır.
- Mann–Whitney, Wilcoxon ve Kruskal–Wallis bağ düzeltmelidir; p değerleri asimptotiktir. İlk ikisinde 0,5 süreklilik düzeltmesi vardır. Wilcoxon sıfır farkları çıkarır ve farkları sayısal eşitlik için 12 anlamlı basamağa yuvarlar.
- Benzetim yerine koyarak 500 örnek seçer; sabit tohumla tekrarlanır. R ve tarayıcının üreteçleri farklıdır; aynı tohumla birebir örnek eşitliği beklenmez.

Normallik, varyans homojenliği, ölçme geçerliği ve örnekleme koşulları otomatik doğrulanmaz. Shapiro–Wilk, Levene, bootstrap güven aralığı ve güç analizi bu ilk sürümde ayrı etkileşimli modül değildir. Kapsam etiketleri öğrenciyi desteklenmeyen bir hesabın var olduğu izlenimine yönlendirmemelidir.

## Kitap ve bölüm bağlantıları

Yeni öğrenci kökü: `https://ibrahimguney.github.io/temelistatistik/`

Her bölüm için `bolumler/b01/` … `bolumler/b14/` altında gerçek bir `index.html` vardır. Bunlar ana çalışma alanında ilgili bölümü açar. QR kodlar bu kalıcı bölüm adreslerini kullanabilir. [Tam eşleştirme](../bolumler/README.md).

Yüklenen V3 taslakta önsöz ve arka bölümde hâlâ `ibrahimguney.github.io/istatistik-lab/` bağlantıları vardır. Pages yayını doğrulandıktan sonra kitabın kaynak dosyalarında yeni kök ve uygun bölüm adresleri kullanılmalı; QR kodlar yeniden üretilmelidir. PDF'deki bir URL'nin depoda yeni dosya oluşturularak kendiliğinden değişmeyeceğini dikkate alın.

## Sonraki geliştirme önerileri

1. Her bölüm için başlangıç, uygulama ve eleştirel yorum düzeylerinde üç ayrı görev; dersin kazanımlarıyla eşlenmiş rubrik.
2. Kitaptaki SPSS çıktıları için kılavuz ve karşılaştırma etkinlikleri; R sonuçlarıyla farkların belgelenmesi.
3. Öğretim elemanının belirleyeceği güvenli teslim kanalı. Mevcut sayfa öğrenci hesabı veya otomatik notlandırma içermez; notlar açık sayfada tutulur.

PISA çalışması mevcut `ibrahimguney/rpd` deposunda ayrı, daha ileri bir araştırma uygulaması olarak devam edebilir.

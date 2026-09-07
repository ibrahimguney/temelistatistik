# Temel İstatistik — Öğrenci Laboratuvarı

**Prof. Dr. İbrahim Güney · PDR 209**  
*Temel İstatistik: PDR Araştırmaları İçin Veri Okuryazarlığı* ders kitabının 14 bölümüne eşlik eden çalışma alanı.

**Öğrenci adresi (GitHub Pages etkinleştirildikten sonra):**  
https://ibrahimguney.github.io/temelistatistik/

Öğrenci önce araştırma sorusunu belirler, veriyi inceler, yöntemi uygular ve sonucu bağlam içinde raporlar. Hazır veriler ve hesaplama kütüphanesi depoda bulunur. Tarayıcıda çalışan laboratuvar için hesap, R kurulumu veya ücretli analiz yazılımı gerekmez.

## Başlangıç

1. Öğrenci adresini açın ve kitaptaki bölümünüzü seçin.
2. Hazır veriyi kullanın veya kimlik bilgisi içermeyen bir CSV açın.
3. Yöntemi ve değişkenleri seçip **Analizi çalıştır** düğmesine basın.
4. Grafiği, etki büyüklüğünü, güven aralığını ve koşulları birlikte inceleyin.
5. Yorumunuzu yazın; **Çalışma raporunu indir** ile çalışmanızı kaydedin.

[Öğrenci kullanım rehberi](rehberler/ogrenci.html) · [Öğretim elemanı rehberi](rehberler/ogretim-elemani.md) · [Bölüm bağlantıları](bolumler/README.md)

## İçerik

| Bileşen | İçerik |
| --- | --- |
| 14 bölüm | Kitabın sırasına uygun soru, öğrenme hedefi, görev ve ipucu |
| 2 hazır veri seti | UCI matematik verisi: 395 öğrenci, 33 değişken; kitap B14: 16 gözlem |
| 16 analiz / uygulama | Frekans, betimleme, z, örnekleme benzetimi, güven aralığı, üç t testi, ANOVA, Pearson, Spearman, regresyon, ki-kare, Mann–Whitney, Wilcoxon, Kruskal–Wallis |
| CSV çalışma alanı | Virgül, noktalı virgül veya sekme; noktalı virgüllü dosyada ondalık virgül desteği |
| Tekrarlanabilirlik | Analize özgü indirilebilir R kodu, veri ve Markdown rapor |
| Yazılım uygulamaları | [R uygulamaları](uygulamalar/analizler.R), [SPSS syntax](uygulamalar/analizler.sps) |

## Veriler

- **UCI Student Performance / student-mat.csv:** Cortez (2008), CC BY 4.0; kaynak dosyanın 395 satırı ve 33 değişkeni korunmuştur. Gerçek, gözlemsel Portekiz verisidir; Türkiye öğrencilerini temsil eden veri değildir.
- **Kitap, Bölüm 14, Tablo 14.2:** 16 gözlemli yapay öğretim verisi. `degisim = son - on` tarayıcı veri kopyasında açıkça türetilir.

[Kaynak, lisans ve veri notları](veriler/KAYNAKLAR.md). Kitabın PDF taslağı bu depoda yayımlanmamıştır.

## Analiz sınırları

Bu uygulama öğretim içindir. Varsayımlar otomatik onaylanmaz. t testleri çift yönlüdür. Welch testi eşit varyans varsaymaz; klasik ANOVA varsayar. Pearson aralığı Fisher z yaklaşımını kullanır. Sıra testlerinin p değerleri asimptotiktir. Küçük / seyrek veride exact veya permütasyon yöntemleri gerekebilir. Ki-kare Yates düzeltmesi kullanmaz. Post-hoc testler tarayıcıda bulunmaz; R örnekleri sağlanır.

UCI verisi iki okuldan gelir; tarayıcıdaki temel çıkarımlar okul kümelenmesini modellemez. PISA gibi karmaşık örneklem verisi ağırlık ve tasarım bilgisi gerektirir; bu araçta basit testler kullanarak nüfus çıkarımı yapılmamalıdır.

CSV verisi dışarı gönderilmez. Notlar yalnız açık sayfada tutulur ve indirilmedikçe kalıcı değildir. Otomatik ödev teslimi, öğretmen paneli veya öğrenci hesabı yoktur.

## GitHub Pages'i açma

Depo sahibi bir kez şu ayarı yapar:

1. **Settings → Pages → Build and deployment**
2. **Source: Deploy from a branch**
3. **Branch: main**, klasör **/(root)** → **Save**

GitHub yayını tamamlandıktan sonra öğrenci adresi ve tüm bölüm bağlantıları açılır. Depoya dosya yüklemek, Pages ayarını otomatik açtığımız anlamına gelmez.

## Yerel kullanım ve doğrulama

`index.html` dosyasını açmak hazır verilerle kullanım için yeterlidir; dış CDN veya veri isteği yapılmaz. İstenirse proje kökünde `python -m http.server 8000` kullanılabilir.

- Tarayıcı verisini üretme: `python veriler/hazirla.py`
- Sayısal doğrulama: `python tests/validate.py` (NumPy, SciPy ve Node.js gerekir)
- Bağlantı ve JavaScript kontrolü: `python tests/static_check.py`

[Doğrulama raporu](DOGRULAMA.md) kullanılan yöntemleri ve kontrol kapsamını açıklar.

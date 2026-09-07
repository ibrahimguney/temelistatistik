# Veri kaynakları, lisanslar ve dönüşümler

## UCI Student Performance

**Atıf:** Cortez, P. (2008). *Student Performance* [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5TG7T

- Kaynak sayfa: https://archive.ics.uci.edu/dataset/320/student+performance
- İndirilen arşiv: https://archive.ics.uci.edu/static/public/320/student+performance.zip
- Arşiv içindeki `student.zip` → `student-mat.csv` dosyası kullanıldı.
- Erişim: 7 Eylül 2026.
- Lisans: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
- Boyut: 395 matematik öğrencisi, 33 değişken. İki Portekiz okulundan gözlemsel kayıtlar.

`student-mat.csv` ve `student-original-dictionary.txt` indirilen arşivden değiştirilmeden alınmıştır. Özgün CSV noktalı virgülle ayrılır. Tarayıcı kopyasında sayısal değerler sayı türüne çevrilmiştir; satır/sütun silinmemiş, eksik değer doldurulmamış ve yeni gözlem üretilmemiştir. Türkçe etiketler öğretim kolaylığı için eklenmiştir. Özgün değişken adları korunmuştur.

G3 içindeki sıfırlar geçerli notlardır; otomatik eksik değer sayılmaz. `studytime` haftalık saat sayısı değil, dört sıralı kategoridir. `sex` kaynak dosyanın F/M kodlamasını taşır. Sözlükteki değişken anlamları dışındaki nedensel, klinik veya kültürel yorumlar verinin desteklediği sonuçlar değildir.

UCI sayfası verinin Cortez ve Silva (2008) çalışmasıyla ilişkili olduğunu belirtir. Dönem notları aynı öğrenciden gelir; bağımsız gruplar gibi analiz edilmemelidir.

## Kitabın bütünleştirici laboratuvarı

**Kaynak:** Güney, İ. (2026). *Temel İstatistik: PDR Araştırmaları İçin Veri Okuryazarlığı*. V3 ders kitabı taslağı. Bölüm 14, Tablo 14.2; basılı sayfa 193.

`kitap-b14.csv` tablodaki 16 satırı içerir: `id`, `grup`, `on`, `son`, `saat`. Bu kayıtlar kitapta **öğretim amacıyla tasarlanmış yapay veri** olarak tanımlanır. Öğrencilere ait gerçek araştırma verisi gibi sunulmaz.

Tarayıcı kopyasına eklenen `degisim` değişkeni `son − on` olarak hesaplanır. Diğer değerler değiştirilmez. Bu veri UCI lisansı kapsamında değildir; ders kitabı yazarının öğretim materyalidir. Kitabın genel telif hakları saklıdır.

## Yerel kullanıcı CSV dosyaları

Dosyalar yalnız kullanıcının tarayıcında okunur. Sunucuya yükleme, izleme, analiz hizmetine gönderme veya yerel kalıcı depolama yoktur. Sınırlar: 2 MB, 5.000 veri satırı, 50 sütun. Boş, `NA`, `N/A`, `null`, `NaN` alanlar eksiktir; 0 ve 999 gibi kodlar kullanıcı doğrulaması olmadan eksik sayılmaz. Analizler yalnız seçili değişkenlerdeki ortak geçerli satırları kullanır. Kaynağını ve paylaşım hakkını doğruladığınız, kimliksiz verilerle çalışın.

## Yazılım bileşeni

Dağılım fonksiyonları için yerel `jStat 1.9.6` kullanılır. Lisans: MIT, [yerel lisans metni](../assets/vendor/JSTAT-LICENSE). Özgün proje: https://github.com/jstat/jstat

Ana hesaplamalar ve CSV ayrıştırma `assets/stats.js` içindedir; doğrulama SciPy ile yapılır. Uygulama açılışında haricî kütüphane veya veri indirilmez.

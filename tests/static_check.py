"""JavaScript sözdizimi ve yerel HTML dosya bağlantılarını doğrular; tarayıcı testi değildir."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import subprocess
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[];self.ids=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        for key in ('src','href'):
            if key in d:self.links.append(d[key])
        if 'id' in d:self.ids.append(d['id'])
count=0
for p in ROOT.rglob('*.html'):
    parser=Links();parser.feed(p.read_text(encoding='utf-8'))
    assert len(parser.ids)==len(set(parser.ids)),f'Tekrarlı HTML id: {p}'
    for link in parser.links:
        u=urlsplit(link)
        if u.scheme or u.netloc or not u.path:continue
        target=(p.parent/unquote(u.path)).resolve()
        assert target.exists(),f'Kırık yerel bağlantı: {p.relative_to(ROOT)} -> {link}'
        count+=1
for p in (ROOT/'assets').glob('*.js'):
    subprocess.run(['node','--check',str(p)],check=True)
for i in range(1,15):
    p=ROOT/f'bolumler/b{i:02d}/index.html'
    assert p.exists() and f'#b{i:02d}' in p.read_text(encoding='utf-8')
assert (ROOT/'.nojekyll').exists()
print(f'{count} yerel HTML bağlantısı, 14 bölüm giriş dosyası ve JavaScript sözdizimi doğrulandı.')

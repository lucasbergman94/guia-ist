#!/usr/bin/env python3
"""Add Turkish (oneLiner_tr / desc_tr / caveat_tr) to each neighborhood in data.json."""
import json, os
BASE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(BASE, "data.json")
TR = {
 "Çamlıtepe / Hacıosman": ("Sakin, yeşil, metroya bağlı","Hacıosman metro durağının (M2) hemen yanında, yerel olanaklara sahip sakin bir konut bölgesi. Sarıyer.",""),
 "Tarabya": ("Boğaz kıyısı, kozmopolit","Boğaz kıyısında restoranları ve sahil yürüyüşü olan bir semt; eski konsolosluk yazlıkları. Kiralar yüksek.",""),
 "Kireçburnu": ("Boğaz kıyısı, deniz ürünleri","Sarıyer'de deniz ürünleri restoranlarıyla bilinen küçük bir sahil bölgesi.","Servis duraklarına biraz uzak."),
 "Darüşşafaka": ("Sakin, metroya yürüme","Darüşşafaka metro durağının (M2) yanında konut bölgesi. Gazeticiler Sitesi gibi siteler var.",""),
 "Emirgan": ("Boğaz semti, büyük park","Sarıyer'de Emirgan Korusu ve sahil restoranları olan bir Boğaz semti. Kiralar yüksek.",""),
 "Maslak": ("İş merkezi, az konut","Çoğunlukla iş merkezi; arkasında lüks siteler var.","Maslak içinde konut seçeneği az."),
 "Poligon": ("Okula yakın","Sarıyer'de okula yakın, daha uygun fiyatlı seçenekleri olan konut bölgesi.","Sokaklar değişken; Google Street View'e bakın."),
 "Reşitpaşa": ("Uygun fiyatlı, Maslak yakını","Sarıyer'de Maslak yakınında, daha uygun seçenekleri olan konut bölgesi.","Sokaklar değişken; Google Street View'e bakın."),
 "Yeniköy": ("Boğaz semti, pahalı","Sarıyer'de güzel bir Boğaz semti. Kiralar yüksek.",""),
 "İstinye": ("Okula yürüme; İstinye Park","Sarıyer'de İstinye Park AVM'nin olduğu Boğaz semti. Okula yürüme mesafesi.","Okula yürüyüş yokuş."),
 "Baltalimanı": ("Küçük Boğaz koyu; metro yok","Emirgan ile Rumelihisarı arasında küçük bir Boğaz koyu; çoğunlukla eski villalar ve bahçe daireleri.","Metro yok; otobüs seyrek; alışveriş Emirgan/İstinye'de (10-15 dk)."),
 "Levent": ("İş ve alışveriş merkezi; M2","M2 metro hattında, uluslararası restoran ve AVM'lerin olduğu yoğun iş ve alışveriş bölgesi.",""),
 "Nisbetiye": ("Levent yakını, sakin","Levent ile Etiler arasında, elçiliklerin de olduğu az katlı konut bölgesi. Yürünebilir.",""),
 "Bebek": ("Boğaz kıyısı, expat topluluğu","Beşiktaş'ta sahil yürüyüşü ve kafe kültürüyle Boğaz kıyısı semti; yerleşik uluslararası topluluk. Kiralar yüksek.",""),
 "Etiler": ("Konut, expat topluluğu","Beşiktaş'ta restoran ve özel okullarıyla konut semti; yerleşik uluslararası topluluk.",""),
 "Esentepe": ("Karma, durağa yürüme","Zincirlikuyu yakınında karma iş/konut bölgesi; yüksek katlı konut ve iyi ulaşım (Zorlu yakın).",""),
 "Balmumcu": ("Konut, merkezi","Zincirlikuyu ile Beşiktaş arasında, Zorlu Center yakınında konut bölgesi.",""),
 "Arnavutköy": ("Boğaz köyü, eski yapı","Beşiktaş'ta 19. yüzyıl ahşap yalıları ve balıkçı limanı olan Boğaz köyü.","Eski yapı stoğu; araç/otobüse bağlı."),
 "Kuruçeşme": ("Boğaz kıyısı şerit","Beşiktaş'ta restoran ve kulüpleri olan dar bir Boğaz kıyısı şeridi.","Konut az ve pahalı."),
 "Kültür": ("Etiler yakını tepeler","Etiler ile Boğaz sırtı arasında az katlı konut bölgesi.",""),
 "Rumelihisarı": ("Boğaz, Boğaziçi Üniv.","Tarihi hisar ve Boğaziçi Üniversitesi yanında Boğaz semti; sahilde balık restoranları.","Küçük bölge, az perakende."),
 "Gayrettepe": ("İyi bağlantı (M2 + metrobüs)","M2 metro ve metrobüsle iyi bağlantılı, orta segment daireleri olan karma bölge.",""),
 "Dikilitaş": ("Beşiktaş merkez yakını","Balmumcu ile Beşiktaş merkez arasında, vapur ve metrobüse yakın kompakt konut bölgesi.",""),
 "Akatlar": ("Konut; market, park","1. Levent yakınında büyük marketler (Migros, CarrefourSA) ve parkları olan yerleşik konut bölgesi.",""),
 "Mecidiyeköy": ("Büyük ulaşım merkezi","Yoğun, merkezi ve büyük ulaşım merkezi (metrobüs, M2, çok sayıda otobüs).",""),
 "19 Mayıs": ("Mecidiyeköy yakını konut","Mecidiyeköy'ün kuzeydoğusunda, günlük olanakları olan konut bölgesi; orta segment kira.",""),
 "İzzet Paşa": ("Konut, merkezi","Şişli/Mecidiyeköy yakınında, yerel dükkanları olan küçük konut bölgesi; merkezi.",""),
 "Şişli (merkez)": ("Ticari merkez; hastaneler","Şişli'nin ticari merkezi; mağazalar, özel hastaneler ve konsolosluklar; orta segment kira.",""),
 "Teşvikiye & Meşrutiyet": ("Lüks, Nişantaşı yakını","Nişantaşı yakınında butikleri ve özel klinikleri olan lüks konut bölgesi; eski prestijli binalar. Kiralar yüksek.",""),
 "Harbiye & Halaskargazi": ("Merkezi, iyi bağlantı","Taksim, Nişantaşı ve Şişli arasında, otobüs ve metro erişimi iyi merkezi bölge.",""),
 "Abbasağa & Vişnezade": ("Beşiktaş yakını yamaç","Beşiktaş'ın iç kısmında; parkı, kafeleri ve barları olan yamaç konut bölgeleri.",""),
 "Beşiktaş (merkez)": ("Merkezi; vapur, çarşı","Vapur iskelesi, balık pazarı ve stadı olan yoğun merkezi semt; güçlü ulaşım (Asya'ya vapur, metrobüs, otobüs).","Yoğun; maç günleri gürültülü."),
 "Cihannüma": ("Beşiktaş üstü tepe","Beşiktaş'ın üstünde manzaralı sırtta konut bölgesi; merkeze yaklaşık 10 dk yürüyüş.","Dönüş yokuşu dik."),
 "Bomonti & Feriköy": ("Konut; organik pazar; M2","Barları, atölyeleri ve Feriköy organik pazarı olan bitişik konut bölgeleri; Osmanbey/Şişli'den M2.",""),
 "İnönü & Gümüşsuyu": ("Dik, merkezi, Kabataş yakını","Taksim ile Kabataş arasında, Boğaz manzaralı ve Kabataş metrobüs/tramvay aktarmasına yakın dik bölgeler.","Dik arazi."),
 "Cihangir": ("Merkezi; kafe kültürü","Beyoğlu'nda kafeleri ve uluslararası topluluğuyla bilinen merkezi semt; İngilizce yaygın.","Dik sokaklar; eski binalar; kiralar yükseldi."),
}
d = json.load(open(OUT, encoding="utf-8")); miss=[]
for n in d["neighborhoods"]:
    if n["name"] in TR:
        ol,de,ca=TR[n["name"]]; n["oneLiner_tr"]=ol; n["desc_tr"]=de; n["caveat_tr"]=ca
    else: miss.append(n["name"])
json.dump(d, open(OUT,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
print("tr added:", len(d["neighborhoods"])-len(miss), "missing:", miss or "none")

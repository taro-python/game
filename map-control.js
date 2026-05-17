/**
 * MGRS Tactical Map - Map Control Subsystem (固定版)
 */

const mapLayers = {
    // 陸自の作図に適した地理院標準地図
    gsistd: L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: "国土地理院"
    }),
    // ★地方・山間部でも極限まで超拡大できる高解像度「全国最新シームレス航空写真」に修正
    gsisat: L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {
        maxZoom: 19, // 限界ズームをさらに引き上げ
        maxNativeZoom: 18,
        attribution: "国土地理院"
    })
};

let activeLayerType = 'off';

function changeMapLayer(type) {
    if (mapLayers.gsistd) map.removeLayer(mapLayers.gsistd);
    if (mapLayers.gsisat) map.removeLayer(mapLayers.gsisat);
    
    const mapElement = document.getElementById('map');

    if (type === 'off') {
        mapElement.style.background = '#111';
    } else {
        mapElement.style.background = '#fff';
        mapLayers[type].addTo(map);
    }
    
    activeLayerType = type;

    ['gsistd', 'gsisat', 'off'].forEach(t => {
        const btn = document.getElementById(`btn_map_${t}`);
        if (btn) btn.classList.toggle('active', t === type);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    changeMapLayer('off');
});

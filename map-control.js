/**
 * MGRS Tactical Map - Map Control Subsystem
 * 地図レイヤーの管理と切り替えを行う独立プログラム
 */

// 地図レイヤーの定義（国土地理院の公式タイルを使用）
const mapLayers = {
    // 陸自の作図・地形判読に最も適した地理院標準地図
    gsistd: L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: "国土地理院"
    }),
    // 高解像度の最新航空写真
    gsisat: L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg', {
        maxZoom: 18,
        attribution: "国土地理院"
    })
};

// 現在選択されているレイヤー名（初期値はオフ）
let activeLayerType = 'off';

/**
 * 地図の背景を切り替える関数
 * @param {string} type - 'gsistd' (陸自地図) / 'gsisat' (航空写真) / 'off' (オフ)
 */
function changeMapLayer(type) {
    // 一旦すべてのレイヤーを地図から外す
    if (mapLayers.gsistd) map.removeLayer(mapLayers.gsistd);
    if (mapLayers.gsisat) map.removeLayer(mapLayers.gsisat);
    
    const mapElement = document.getElementById('map');

    if (type === 'off') {
        // オフの場合は背景を真っ黒にする
        mapElement.style.background = '#111';
    } else {
        // 地図を表示する場合は背景を白に戻し、選択されたレイヤーを重ねる
        mapElement.style.background = '#fff';
        mapLayers[type].addTo(map);
    }
    
    activeLayerType = type;

    // UIボタンの立体的なアクティブ状態（青色表示）を同期させる
    ['gsistd', 'gsisat', 'off'].forEach(t => {
        const btn = document.getElementById(`btn_map_${t}`);
        if (btn) {
            btn.classList.toggle('active', t === type);
        }
    });

    // ※ 後ほどキャンバスへのグリッド再描画処理(render)が追加されたらここに紐付けます
}

// 初期化時に「オフ」を適用してボタン状態を整える
window.addEventListener('DOMContentLoaded', () => {
    changeMapLayer('off');
});

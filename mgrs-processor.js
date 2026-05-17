/**
 * MGRS Tactical Map - Coordinates Processor
 * MGRS座標の解析・変換・マップへの登録処理を行う独立プログラム
 */

// 各座標に配置するマップ上のマーカーを管理するオブジェクト
const tacticalMarkers = {
    pos: null,    // 陣地
    op1: null,   // 第1観測所
    op2: null,   // 第2観測所
    target: null  // 目標
};

/**
 * MGRS文字列（10桁またはそれ以下）を緯度経度[lat, lng]に一発変換する関数
 * @param {string} zone - グリッド指定 (例: "54TYP")
 * @param {string} digits - 座標数字 (例: "0390580872")
 * @returns {Array|null} [緯度, 経度] またはエラー時 null
 */
function convertMGRSToLatLng(zone, digits) {
    // 空白を削除して大文字に統一
    const cleanZone = zone.trim().toUpperCase();
    const cleanDigits = digits.trim().replace(/\s+/g, '');

    if (!cleanZone || !cleanDigits) return null;

    try {
        // 例: "54TYP" + "0390580872" = "54TYP0390580872" を生成
        const fullMGRS = cleanZone + cleanDigits;
        
        // 外部ライブラリ (mgrs.toPoint) を呼び出して [経度, 緯度] を取得
        const point = mgrs.toPoint(fullMGRS);
        
        // Leafletで扱いやすいように [緯度(Lat), 経度(Lng)] の順番に並び替えて返す
        return [point[1], point[0]];
    } catch (error) {
        console.error("MGRS変換エラー:", error);
        return null;
    }
}

/**
 * 画面上の入力フォームから値をすべて回収し、マップにマーカーを展開する
 */
function processRegistration() {
    // 1. 各フォームから文字列を取得
    const zone = document.getElementById('mgrs_zone').value;
    const posVal = document.getElementById('mgrs_pos').value;
    const op1Val = document.getElementById('mgrs_op1').value;
    const op2Val = document.getElementById('mgrs_op2').value;
    const tgVal = document.getElementById('mgrs_target').value;

    // グリッド指定がなければ処理を中断
    if (!zone.trim()) {
        alert("グリッド指定（例: 54TYP）を入力してください。");
        return;
    }

    // 2. 各座標を緯度経度に一斉変換
    const coords = {
        pos: convertMGRSToLatLng(zone, posVal),
        op1: convertMGRSToLatLng(zone, op1Val),
        op2: convertMGRSToLatLng(zone, op2Val),
        target: convertMGRSToLatLng(zone, tgVal)
    };

    let registeredCount = 0;
    const bounds = []; // マップ表示を自動調整するための配列

    // 3. マーカーの配置・更新ループ処理
    const configs = [
        { key: 'pos', name: '陣地', color: '#ff9f43' },
        { key: 'op1', name: '第1観測所 [OP1]', color: '#54a0ff' },
        { key: 'op2', name: '第2観測所 [OP2]', color: '#00cec9' },
        { key: 'target', name: '目標 [TG]', color: '#ff6b6b' }
    ];

    configs.forEach(cfg => {
        const latlng = coords[cfg.key];
        
        // 既存の古いマーカーがあれば一旦消去
        if (tacticalMarkers[cfg.key]) {
            map.removeLayer(tacticalMarkers[cfg.key]);
            tacticalMarkers[cfg.key] = null;
        }

        // 変換に成功した場合のみ新しいマーカーを作成
        if (latlng) {
            // Leafletのサークルマーカーを使って見やすく描画
            tacticalMarkers[cfg.key] = L.circleMarker(latlng, {
                radius: 8,
                fillColor: cfg.color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map).bindPopup(`<b>${cfg.name}</b>`);

            bounds.push(latlng);
            registeredCount++;
        }
    });

    // 4. 結果のフィードバックとカメラ移動
    if (registeredCount > 0) {
        // 入力されたすべてのピンが画面にちょうど収まる位置へ自動でカメラをジャンプさせる
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        
        // 右上の「Area」表示を現在のグリッド名に書き換える
        document.getElementById('info_zone').innerText = `Area: ${zone.trim().toUpperCase()}`;
        
        // メニューを自動で閉じる
        closeMenu();
    } else {
        alert("有効な座標がありません。数字が正しいか確認してください。");
    }
}

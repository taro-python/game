/**
 * MGRS Tactical Map - Coordinates Processor (固定版)
 */

const tacticalMarkers = { pos: null, op1: null, op2: null, target: null };

function convertMGRSToLatLng(zone, digits) {
    // 空白やハイフンを完全に除去
    let cleanZone = zone.trim().toUpperCase().replace(/\s+/g, '');
    let cleanDigits = digits.trim().replace(/\s+/g, '');

    if (!cleanZone || !cleanDigits) return null;

    try {
        // もしユーザーが「54T」とだけ入れて、数字側に「YP03905...」と入力した場合でも自動結合
        let fullMGRS = cleanZone + cleanDigits;
        
        // ハイフンやスペースが含まれていた場合の保険措置として規格を再チェック
        // 例: "54TYP0390580872" の形を強制的に形成
        const point = mgrs.toPoint(fullMGRS);
        return [point[1], point[0]]; // [緯度, 経度]
    } catch (error) {
        // エラーログをコンソールに出してデバッグしやすくする
        console.warn("MGRS変換エラー検出（スキップします）:", cleanDigits);
        return null;
    }
}

function processRegistration() {
    const zone = document.getElementById('mgrs_zone').value;
    const posVal = document.getElementById('mgrs_pos').value;
    const op1Val = document.getElementById('mgrs_op1').value;
    const op2Val = document.getElementById('mgrs_op2').value;
    const tgVal = document.getElementById('mgrs_target').value;

    if (!zone.trim()) {
        alert("グリッド指定（例: 54TYP）を入力してください。");
        return;
    }

    const coords = {
        pos: convertMGRSToLatLng(zone, posVal),
        op1: convertMGRSToLatLng(zone, op1Val),
        coords: convertMGRSToLatLng(zone, op2Val), // 予備
        op2: convertMGRSToLatLng(zone, op2Val),
        target: convertMGRSToLatLng(zone, tgVal)
    };

    let registeredCount = 0;
    const bounds = [];

    const configs = [
        { key: 'pos', name: '陣地', color: '#ff9f43' },
        { key: 'op1', name: '第1観測所 [OP1]', color: '#54a0ff' },
        { key: 'op2', name: '第2観測所 [OP2]', color: '#00cec9' },
        { key: 'target', name: '目標 [TG]', color: '#ff6b6b' }
    ];

    configs.forEach(cfg => {
        const latlng = coords[cfg.key];
        
        if (tacticalMarkers[cfg.key]) {
            map.removeLayer(tacticalMarkers[cfg.key]);
            tacticalMarkers[cfg.key] = null;
        }

        if (latlng) {
            // 現地でピンが見やすくなるよう、少し大きめのサークルマーカーでプロット
            tacticalMarkers[cfg.key] = L.circleMarker(latlng, {
                radius: 9,
                fillColor: cfg.color,
                color: '#ffffff',
                weight: 2.5,
                opacity: 1,
                fillOpacity: 0.85
            }).addTo(map).bindPopup(`<b>${cfg.name}</b>`);

            bounds.push(latlng);
            registeredCount++;
        }
    });

    if (registeredCount > 0) {
        // 遠軽演習場をバッチリ視認できるズームレベル16へジャンプ
        if(bounds.length === 1) {
            map.setView(bounds[0], 16);
        } else {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }
        document.getElementById('info_zone').innerText = `Area: ${zone.trim().toUpperCase()}`;
        closeMenu();
    } else {
        alert("座標を解析できませんでした。\n「グリッド指定」に 54TYP、「陣地座標」に 10桁の数字 が入っているかご確認ください。");
    }
}

/**
 * MGRS Tactical Map - Coordinates Processor (完全同期・バグ修正版)
 */

const tacticalMarkers = { pos: null, op1: null, op2: null, target: null };

function convertMGRSToLatLng(zone, digits) {
    if (!zone || !digits) return null;
    
    let cleanZone = zone.trim().toUpperCase().replace(/\s+/g, '');
    let cleanDigits = digits.trim().replace(/\s+/g, '');

    if (!cleanZone || !cleanDigits) return null;

    try {
        let fullMGRS = cleanZone + cleanDigits;
        const point = mgrs.toPoint(fullMGRS);
        return [point[1], point[0]]; // [緯度, 経度]
    } catch (error) {
        console.warn("MGRS変換エラー検出:", cleanDigits);
        return null;
    }
}

function processRegistration() {
    // 画面上のフォームから現在の文字を「リアルタイム」で確実に取得
    const zone = document.getElementById('mgrs_zone').value.trim();
    const posVal = document.getElementById('mgrs_pos').value.trim();
    const op1Val = document.getElementById('mgrs_op1').value.trim();
    const op2Val = document.getElementById('mgrs_op2').value.trim();
    const tgVal = document.getElementById('mgrs_target').value.trim();

    if (!zone) {
        alert("グリッド指定（例: 54TYP）を入力してください。");
        return;
    }

    const coords = {
        pos: convertMGRSToLatLng(zone, posVal),
        op1: convertMGRSToLatLng(zone, op1Val),
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
        // モザイク状態を消し去るため、遠軽演習場の地形が1枚でクッキリ見える「最大ズームレベル18」へ強制ジャンプ
        if (bounds.length === 1) {
            map.setView(bounds[0], 18);
        } else {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
        }
        
        // 右上の表示を更新
        document.getElementById('info_zone').innerText = `Area: ${zone.toUpperCase()}`;
        closeMenu();
    } else {
        alert("座標を解析できませんでした。\n「グリッド指定」に 54TYP、「陣地座標」に 10桁の数字 が正しく入っているかご確認ください。");
    }
}

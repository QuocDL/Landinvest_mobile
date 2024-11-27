export async function getCenterOfBoundingBoxes(boundingBoxes: any) {
    // Kiểm tra kiểu dữ liệu, nếu là chuỗi, xử lý nó thành mảng
    if (typeof boundingBoxes === 'string') {
        // Trường hợp nếu chuỗi có dấu ngoặc vuông (dạng JSON mảng)
        if (boundingBoxes.startsWith('[') && boundingBoxes.endsWith(']')) {
            boundingBoxes = JSON.parse(boundingBoxes);  // Chuyển chuỗi JSON thành mảng
        } else {
            // Trường hợp nếu chuỗi có dạng "1,2,3,4,"
            boundingBoxes = boundingBoxes.split(',').map((item: string) => parseFloat(item.trim()));  // Tách chuỗi thành mảng số
        }
    }
    // Kiểm tra dữ liệu sau khi xử lý chuỗi
    if (!Array.isArray(boundingBoxes) || boundingBoxes.length < 4) {
        throw new Error('Dữ liệu không hợp lệ, phải là mảng hoặc chuỗi hợp lệ')
    }

    // Tính toán min/max của từng phần tử trong bounding box
    const minLon = parseFloat(boundingBoxes[0]);
    const minLat = parseFloat(boundingBoxes[1]);
    const maxLon = parseFloat(boundingBoxes[2]);
    const maxLat = parseFloat(boundingBoxes[3]);

    // Kiểm tra xem có phải là số hợp lệ không
    if (isNaN(minLon) || isNaN(minLat) || isNaN(maxLon) || isNaN(maxLat)) {
        console.error("Một hoặc nhiều giá trị không phải là số hợp lệ");
        return { centerLat: null, centerLon: null, latitudeDelta: null, longitudeDelta: null };
    }

    // Tính trung điểm của bounding box
    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Tính latitudeDelta và longitudeDelta
    const latitudeDelta = maxLat - minLat;
    const longitudeDelta = maxLon - minLon;

    // Trả về kết quả
    return { centerLat, centerLon, latitudeDelta, longitudeDelta };
}

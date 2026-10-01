/**
 * ============================================
 * OVERNIGHT COFFEE - GOOGLE APPS SCRIPT
 * ============================================
 * Nhận đơn hàng qua POST request.
 * Lưu vào Google Sheets: ORDERS và ORDER_ITEMS.
 * ============================================
 *
 * HƯỚNG DẪN:
 * 1. Tạo Google Sheets mới
 * 2. Tạo sheet "ORDERS" với các cột: Order ID, Thời gian, Họ tên, Số điện thoại, Hình thức nhận, Địa chỉ, Tổng số lượng, Tổng tiền, Ghi chú, Trạng thái
 * 3. Tạo sheet "ORDER_ITEMS" với các cột: Order ID, Tên món, Danh mục, Size, Topping, Số lượng, Đơn giá, Tiền topping, Thành tiền
 * 4. Vào Extensions → Apps Script
 * 5. Paste toàn bộ code này vào Code.gs
 * 6. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy URL và paste vào biến GOOGLE_SCRIPT_URL trong app.js
 */

// ===== CONFIGURATION =====
const SHEET_ORDERS = 'ORDERS';
const SHEET_ORDER_ITEMS = 'ORDER_ITEMS';
const DEFAULT_STATUS = 'Đơn mới';

/**
 * Xử lý POST request từ frontend
 */
function doPost(e) {
  // Sử dụng LockService để tránh xung đột khi nhiều người đặt cùng lúc
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000); // Chờ tối đa 30 giây

    // Parse JSON từ request body
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createResponse(false, 'Dữ liệu không hợp lệ');
    }

    // Validate dữ liệu
    const validation = validateOrderData(data);
    if (!validation.valid) {
      return createResponse(false, validation.message);
    }

    // Lấy spreadsheet hiện tại
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Tạo Order ID nếu frontend không gửi
    const orderId = data.orderId || generateOrderId();
    const createdAt = data.createdAt || getCurrentTime();

    // ──────────────────────────────────────
    // LƯU VÀO SHEET ORDERS
    // ──────────────────────────────────────
    const ordersSheet = ss.getSheetByName(SHEET_ORDERS);
    if (!ordersSheet) {
      return createResponse(false, 'Không tìm thấy sheet ORDERS');
    }

    ordersSheet.appendRow([
      orderId,                                // A: Order ID
      createdAt,                              // B: Thời gian
      data.customer.name,                     // C: Họ tên
      data.customer.phone,                    // D: Số điện thoại
      data.customer.receiveType === 'delivery' ? 'Giao hàng' : 'Nhận tại quán', // E: Hình thức nhận
      data.customer.address || '',            // F: Địa chỉ
      data.totalQuantity || 0,                // G: Tổng số lượng
      data.grandTotal || 0,                   // H: Tổng tiền
      data.note || '',                        // I: Ghi chú
      DEFAULT_STATUS,                         // J: Trạng thái
    ]);

    // ──────────────────────────────────────
    // LƯU VÀO SHEET ORDER_ITEMS
    // ──────────────────────────────────────
    const itemsSheet = ss.getSheetByName(SHEET_ORDER_ITEMS);
    if (!itemsSheet) {
      return createResponse(false, 'Không tìm thấy sheet ORDER_ITEMS');
    }

    // Loop qua từng item trong đơn
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach(function(item) {
        // Xử lý topping thành chuỗi
        const toppingNames = (item.toppings || []).map(function(t) {
          return t.name;
        }).join(', ');

        const toppingTotal = item.toppingTotal || 0;

        itemsSheet.appendRow([
          orderId,            // Order ID
          item.name,          // Tên món
          item.category,      // Danh mục
          item.size,          // Size
          toppingNames || '-', // Topping
          item.quantity,      // Số lượng
          item.basePrice,     // Đơn giá
          toppingTotal,       // Tiền topping
          item.total,         // Thành tiền
        ]);
      });
    }

    // Trả về kết quả thành công
    return createResponse(true, 'Đặt hàng thành công', orderId);

  } catch (error) {
    // Xử lý lỗi
    console.error('Error in doPost:', error);
    return createResponse(false, 'Lỗi hệ thống: ' + error.message);

  } finally {
    // Luôn giải phóng lock
    lock.releaseLock();
  }
}

/**
 * Xử lý GET request (cho test)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Overnight Coffee Order API is running',
      timestamp: new Date().toISOString(),
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════

/**
 * Validate dữ liệu đơn hàng
 */
function validateOrderData(data) {
  if (!data) {
    return { valid: false, message: 'Không có dữ liệu' };
  }

  if (!data.customer) {
    return { valid: false, message: 'Thiếu thông tin khách hàng' };
  }

  if (!data.customer.name || data.customer.name.trim() === '') {
    return { valid: false, message: 'Thiếu họ tên khách hàng' };
  }



  // Validate items
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { valid: false, message: 'Đơn hàng phải có ít nhất 1 món' };
  }

  return { valid: true };
}

/**
 * Tạo response JSON
 */
function createResponse(success, message, orderId) {
  const result = {
    success: success,
    message: message || '',
  };

  if (orderId) {
    result.orderId = orderId;
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tạo Order ID dạng OC-YYYYMMDD-XXX
 */
function generateOrderId() {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');

  // Đếm số đơn trong ngày để tạo số thứ tự
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName(SHEET_ORDERS);
  const lastRow = ordersSheet.getLastRow();
  let todayCount = 0;

  if (lastRow > 1) {
    const orderIds = ordersSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const todayPrefix = 'OC-' + dateStr;
    todayCount = orderIds.filter(function(row) {
      return row[0] && row[0].toString().startsWith(todayPrefix);
    }).length;
  }

  const seq = String(todayCount + 1).padStart(3, '0');
  return 'OC-' + dateStr + '-' + seq;
}

/**
 * Lấy thời gian hiện tại
 */
function getCurrentTime() {
  const now = new Date();
  return Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Hàm khởi tạo sheets (chạy 1 lần khi setup)
 * Tạo headers cho cả 2 sheets
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Tạo/setup sheet ORDERS ──
  let ordersSheet = ss.getSheetByName(SHEET_ORDERS);
  if (!ordersSheet) {
    ordersSheet = ss.insertSheet(SHEET_ORDERS);
  }

  // Kiểm tra nếu chưa có header
  if (ordersSheet.getLastRow() === 0) {
    const headers = [
      'Order ID', 'Thời gian', 'Họ tên', 'Số điện thoại',
      'Hình thức nhận', 'Địa chỉ', 'Tổng số lượng', 'Tổng tiền',
      'Ghi chú', 'Trạng thái'
    ];
    ordersSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header
    const headerRange = ordersSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1a5c2e');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');

    // Set độ rộng cột
    ordersSheet.setColumnWidth(1, 160);  // Order ID
    ordersSheet.setColumnWidth(2, 160);  // Thời gian
    ordersSheet.setColumnWidth(3, 150);  // Họ tên
    ordersSheet.setColumnWidth(4, 120);  // SĐT
    ordersSheet.setColumnWidth(5, 120);  // Hình thức nhận
    ordersSheet.setColumnWidth(6, 200);  // Địa chỉ
    ordersSheet.setColumnWidth(7, 100);  // Tổng SL
    ordersSheet.setColumnWidth(8, 120);  // Tổng tiền
    ordersSheet.setColumnWidth(9, 200);  // Ghi chú
    ordersSheet.setColumnWidth(10, 100); // Trạng thái

    // Freeze header row
    ordersSheet.setFrozenRows(1);
  }

  // ── Tạo/setup sheet ORDER_ITEMS ──
  let itemsSheet = ss.getSheetByName(SHEET_ORDER_ITEMS);
  if (!itemsSheet) {
    itemsSheet = ss.insertSheet(SHEET_ORDER_ITEMS);
  }

  if (itemsSheet.getLastRow() === 0) {
    const headers = [
      'Order ID', 'Tên món', 'Danh mục', 'Size', 'Topping',
      'Số lượng', 'Đơn giá', 'Tiền topping', 'Thành tiền'
    ];
    itemsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header
    const headerRange = itemsSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#6b4226');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');

    // Set độ rộng cột
    itemsSheet.setColumnWidth(1, 160);  // Order ID
    itemsSheet.setColumnWidth(2, 200);  // Tên món
    itemsSheet.setColumnWidth(3, 120);  // Danh mục
    itemsSheet.setColumnWidth(4, 60);   // Size
    itemsSheet.setColumnWidth(5, 250);  // Topping
    itemsSheet.setColumnWidth(6, 80);   // Số lượng
    itemsSheet.setColumnWidth(7, 100);  // Đơn giá
    itemsSheet.setColumnWidth(8, 100);  // Tiền topping
    itemsSheet.setColumnWidth(9, 120);  // Thành tiền

    // Freeze header row
    itemsSheet.setFrozenRows(1);
  }

  // Thông báo hoàn thành
  SpreadsheetApp.getUi().alert('✅ Đã tạo xong các sheet ORDERS và ORDER_ITEMS!');
}

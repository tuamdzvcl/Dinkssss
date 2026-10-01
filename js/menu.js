/**
 * ============================================
 * OVERNIGHT COFFEE - MENU DATA
 * ============================================
 * Quản lý tập trung toàn bộ dữ liệu menu.
 * Chỉ cần sửa file này khi thay đổi menu.
 * ============================================
 */

// ===== TOPPING ADD-ONS =====
// Danh sách topping có thể thêm vào đồ uống
const TOPPINGS = [
  { id: 'tp-tc-hoang-gia', name: 'Trân châu hoàng gia', price: 5000 },
  { id: 'tp-tc-3q', name: 'Trân châu 3Q', price: 5000 },
  { id: 'tp-thach-dua', name: 'Thạch dừa', price: 5000 },
  { id: 'tp-nha-dam', name: 'Nha đam', price: 5000 },
  { id: 'tp-kem-trung', name: 'Kem trứng / Cheese', price: 5000 },
];

// ===== MENU DATA =====
// Mỗi category chứa danh sách items
// Mỗi item có: id, name, prices (theo size), hasTopping, isNew, isPopular
// prices dạng { S: 20000, M: 30000 } hoặc { default: 8000 } cho món không có size
const MENU = [
  // ───────────────────────────────────────
  // MÓN MỚI
  // ───────────────────────────────────────

  {
    id: 'anh-ban-xoi',
    category: 'Anh Bán Xôi',
    icon: '🆕',
    items: [
      // BÁNH MÌ
      {
        id: 'bm-pate-trung',
        name: 'Bánh Mì Pate Trứng',
        prices: { M: 18000 },
        hasTopping: false,
      },

      {
        id: 'bm-pate-xuc-xich',
        name: 'Bánh Mì Pate Xúc Xích',
        prices: { M: 20000 },
        hasTopping: false,
      },

      {
        id: 'bm-doner-kabab-thit-nuong',
        name: 'Bánh Mì Doner Kabab Thịt Nướng',
        prices: { M: 25000 },
        hasTopping: false,
      },

      {
        id: 'bm-doner-kabab-dac-biet',
        name: 'Bánh Mì Doner Kabab Đặc Biệt',
        prices: { M: 35000 },
        hasTopping: false,
      },

      // XÔI
      {
        id: 'xoi-pate-trung',
        name: 'Xôi Pate Trứng',
        prices: { M: 20000 },
        hasTopping: false,
      },

      {
        id: 'xoi-pate-xuc-xich',
        name: 'Xôi Pate Xúc Xích',
        prices: { M: 20000 },
        hasTopping: false,
      },

      {
        id: 'xoi-doner-kabab-thit-nuong',
        name: 'Xôi Doner Kabab Thịt Nướng',
        prices: { M: 25000 },
        hasTopping: false,
      },

      {
        id: 'xoi-doner-kabab-dac-biet',
        name: 'Xôi Doner Kabab Đặc Biệt',
        prices: { M: 35000 },
        hasTopping: false,
      },
    ]
  },
  {
    id: 'cat-mon-moi',
    category: 'Món Mới',
    icon: '🆕',
    items: [
      {
        id: 'new-sen-dua-lanh',
        name: 'Sen Dừa Lạnh',
        prices: { L: 35000 },
        isNew: true,
        hasTopping: true,
      },
      {
        id: 'new-sua-dua-com',
        name: 'Sữa Dừa Cốm',
        prices: { L: 35000 },
        isNew: true,
        hasTopping: true,
      },
      {
        id: 'new-ts-com-kem-trung',
        name: 'Trà Sữa Cốm Kem Trứng',
        prices: { L: 35000 },
        isNew: true,
        hasTopping: true,
      },
    ],
  },

  // ───────────────────────────────────────
  // CÀ PHÊ
  // ───────────────────────────────────────
  {
    id: 'cat-ca-phe',
    category: 'Cà Phê',
    icon: '☕',
    items: [
      {
        id: 'cf-den-da',
        name: 'Đen Đá',
        prices: { S: 20000, M: 30000 },
        hasTopping: true,
      },
      {
        id: 'cf-nau-da',
        name: 'Nâu Đá',
        prices: { S: 20000, M: 30000 },
        hasTopping: true,
      },
      {
        id: 'cf-bac-xiu',
        name: 'Bạc Xỉu',
        prices: { S: 22000, M: 33000 },
        hasTopping: true,
      },
      {
        id: 'cf-muoi',
        name: 'Cafe Muối',
        prices: { S: 25000, M: 38000 },
        isPopular: true,
        hasTopping: true,
      },
      {
        id: 'cf-kakao',
        name: 'Kakao Sữa Đá',
        prices: { S: 25000 },
        hasTopping: true,
      },
    ],
  },

  // ───────────────────────────────────────
  // SỮA CHUA
  // ───────────────────────────────────────
  {
    id: 'cat-sua-chua',
    category: 'Sữa Chua',
    icon: '🥛',
    items: [
      {
        id: 'sc-danh-da',
        name: 'Sữa Chua Đánh Đá',
        prices: { M: 25000, L: 35000 },
        hasTopping: true,
      },
      {
        id: 'sc-chanh-leo',
        name: 'Sữa Chua Chanh Leo',
        prices: { M: 25000, L: 35000 },
        hasTopping: true,
      },
      {
        id: 'sc-viet-quat',
        name: 'Sữa Chua Việt Quất',
        prices: { M: 25000, L: 35000 },
        hasTopping: true,
      },
      {
        id: 'sc-hoa-qua',
        name: 'Sữa Chua Hoa Quả',
        prices: { M: 25000, L: 35000 },
        hasTopping: true,
      },
      {
        id: 'sc-xoai',
        name: 'Sữa Chua Xoài',
        prices: { M: 25000, L: 35000 },
        hasTopping: true,
      },
    ],
  },

  // ───────────────────────────────────────
  // KEM CHEESE
  // ───────────────────────────────────────
  {
    id: 'cat-kem-cheese',
    category: 'Kem Cheese',
    icon: '🧀',
    items: [
      {
        id: 'kc-tra-nhai',
        name: 'Trà Nhài Kem Cheese',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'kc-socola',
        name: 'Socola Kem Cheese',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'kc-matcha',
        name: 'Matcha Kem Cheese',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
    ],
  },

  // ───────────────────────────────────────
  // ĐỒ ĂN
  // ───────────────────────────────────────
  {
    id: 'cat-do-an',
    category: 'Đồ Ăn',
    icon: '🍿',
    items: [
      {
        id: 'da-bimbim',
        name: 'Bim bim',
        prices: { default: 8000 },
        hasTopping: false,
      },
      {
        id: 'da-hd-thuong',
        name: 'Hướng dương thường',
        prices: { default: 15000 },
        hasTopping: false,
      },
      {
        id: 'da-hd-vi',
        name: 'Hướng dương vị',
        prices: { default: 15000 },
        hasTopping: false,
      },
      {
        id: 'da-bo-kho',
        name: 'Bò khô',
        prices: { default: 25000 },
        hasTopping: false,
      },
      {
        id: 'da-heo-kho',
        name: 'Heo khô',
        prices: { default: 25000 },
        hasTopping: false,
      },
      {
        id: 'da-xoai-dam',
        name: 'Xoài dầm bò khô',
        prices: { default: 30000 },
        hasTopping: false,
      },
      {
        id: 'da-hoa-qua-dia',
        name: 'Hoa quả đĩa',
        prices: { default: 40000 },
        hasTopping: false,
      },
    ],
  },

  // ───────────────────────────────────────
  // TRÀ HOA QUẢ
  // ───────────────────────────────────────
  {
    id: 'cat-tra-hoa-qua',
    category: 'Trà Hoa Quả',
    icon: '🍹',
    items: [
      {
        id: 'thq-tra-chanh',
        name: 'Trà Chanh',
        prices: { M: 10000, L: 15000 },
        hasTopping: true,
      },
      {
        id: 'thq-tra-tac',
        name: 'Trà Tắc',
        prices: { M: 10000, L: 15000 },
        hasTopping: true,
      },
      {
        id: 'thq-chanh-nha-dam',
        name: 'Trà Chanh Nha Đam',
        prices: { M: 15000, L: 20000 },
        hasTopping: true,
      },
      {
        id: 'thq-tac-nha-dam',
        name: 'Trà Tắc Nha Đam',
        prices: { M: 15000, L: 20000 },
        hasTopping: true,
      },
      {
        id: 'thq-oi-hong-td',
        name: 'Trà Ổi Hồng Thạch Dừa',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-dao',
        name: 'Trà Đào',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-xoai-nd',
        name: 'Trà Xoài Nhiệt Đới Thạch Dừa',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-dao-cam-sa',
        name: 'Trà Đào Cam Sả',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-dau-tay-td',
        name: 'Trà Dâu Tây Thạch Dừa',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-vai-td',
        name: 'Trà Vải Thạch Dừa',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-hoa-qua-nd',
        name: 'Trà Hoa Quả Nhiệt Đới',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-dua-luoi-td',
        name: 'Trà Dưa Lưới Thạch Dừa',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-duong-chi',
        name: 'Dưỡng Chi Cam Lộ',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'thq-bi-dao',
        name: 'Trà Bí Đao',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
    ],
  },

  // ───────────────────────────────────────
  // TRÀ SỮA
  // ───────────────────────────────────────
  {
    id: 'cat-tra-sua',
    category: 'Trà Sữa',
    icon: '🧋',
    items: [
      {
        id: 'ts-hong-tra-sua',
        name: 'Hồng Trà Sữa',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-tran-chau-dd',
        name: 'Trà Sữa Trân Châu Đường Đen',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-st-tran-chau-dd',
        name: 'Sữa Tươi Trân Châu Đường Đen',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-socola',
        name: 'Trà Sữa Socola',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-matcha',
        name: 'Trà Sữa Matcha',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-khoai-mon',
        name: 'Trà Sữa Khoai Môn',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-dau-tay',
        name: 'Trà Sữa Dâu Tây',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-vani',
        name: 'Trà Sữa Vani',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-caramel',
        name: 'Trà Sữa Caramel',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-hat-de',
        name: 'Trà Sữa Hạt Dẻ',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-bac-ha',
        name: 'Trà Sữa Bạc Hà',
        prices: { M: 25000, L: 30000 },
        hasTopping: true,
      },
      {
        id: 'ts-kem-trung-dua',
        name: 'Trà Sữa Kem Trứng Dừa Nướng',
        prices: { M: 30000, L: 35000 },
        hasTopping: true,
      },
      {
        id: 'ts-com-kem-trung',
        name: 'Trà Sữa Cốm Kem Trứng',
        prices: { L: 35000 },
        hasTopping: true,
      },
      {
        id: 'ts-sua-dua-com',
        name: 'Sữa Dừa Cốm',
        prices: { L: 35000 },
        hasTopping: true,
      },
      {
        id: 'ts-sen-dua-lanh',
        name: 'Sen Dừa Lạnh',
        prices: { M: 30000, L: 35000 },
        hasTopping: true,
      },
    ],
  },

  // ───────────────────────────────────────
  // ĐỒ NÓNG
  // ───────────────────────────────────────
  {
    id: 'cat-do-nong',
    category: 'Đồ Nóng',
    icon: '🔥',
    items: [
      {
        id: 'dn-tra-cam-que',
        name: 'Trà cam quế mật ong',
        prices: { default: 25000 },
        hasTopping: true,
      },
      {
        id: 'dn-tra-dao-nong',
        name: 'Trà đào nóng',
        prices: { default: 25000 },
        hasTopping: true,
      },
      {
        id: 'dn-kakao-nong',
        name: 'Kakao nóng',
        prices: { default: 25000 },
        hasTopping: true,
      },
    ],
  },

  // ───────────────────────────────────────
  // NƯỚC ÉP
  // ───────────────────────────────────────
  {
    id: 'cat-nuoc-ep',
    category: 'Nước Ép',
    icon: '🍊',
    items: [
      {
        id: 'ne-cam',
        name: 'Cam ép',
        prices: { M: 25000, L: 35000 },
        hasTopping: true,
      },
      {
        id: 'ne-dua-hau',
        name: 'Dưa hấu',
        prices: { M: 25000, L: 35000 },
        hasTopping: true,
      },
      {
        id: 'ne-chanh-leo',
        name: 'Chanh leo',
        prices: { M: 25000, L: 35000 },
        hasTopping: true,
      },
    ],
  },

  // ───────────────────────────────────────
  // TOPPING (đặt riêng)
  // ───────────────────────────────────────
  {
    id: 'cat-topping',
    category: 'Topping',
    icon: '🫧',
    items: [
      {
        id: 'tp-order-tc-hoang-gia',
        name: 'Trân châu hoàng gia',
        prices: { default: 5000 },
        hasTopping: false,
      },
      {
        id: 'tp-order-tc-3q',
        name: 'Trân châu 3Q',
        prices: { default: 5000 },
        hasTopping: false,
      },
      {
        id: 'tp-order-thach-dua',
        name: 'Thạch dừa',
        prices: { default: 5000 },
        hasTopping: false,
      },
      {
        id: 'tp-order-nha-dam',
        name: 'Nha đam',
        prices: { default: 5000 },
        hasTopping: false,
      },
      {
        id: 'tp-order-kem-trung',
        name: 'Kem trứng / Cheese',
        prices: { default: 5000 },
        hasTopping: false,
      },
    ],
  },
];

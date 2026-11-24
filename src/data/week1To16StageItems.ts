import type { LearningItem } from './seedQuestions';

export const WEEK_1_TO_16_STAGE_1_ITEMS: LearningItem[] = [
  {
    id: 'week1-16-c1-d1-tn1',
    subject: 'toan',
    topic: 'Phương trình bậc nhất hai ẩn',
    weekSpan: 1,
    sourceRef: 'Tuần 1 • [CĐOT] Bộ Đề Theo Chương Toán 9 - 7991 - Chương 1, Đề số 1, TN Câu 1',
    phaseOneCheck:
      'Nhắc lại dạng tổng quát ax + by = c và điều kiện của các hệ số a, b trước khi loại trừ.',
    phaseOneQuickCheck: {
      question: 'Trong phương trình bậc nhất hai ẩn ax + by = c, điều kiện của a và b là gì?',
      options: [
        'a ≠ 0 hoặc b ≠ 0',
        'a = 0 và b = 0',
        'c ≠ 0',
      ],
      correctAnswer: 'a ≠ 0 hoặc b ≠ 0',
    },
    errorCategory: 'concept',
    prompt:
      'Trong các phương trình sau, phương trình nào không phải là phương trình bậc nhất hai ẩn?',
    options: [
      'x + 2y = 1',
      '0x - 0y = 5',
      '0x - y = 3',
      'x + 0y = -6',
    ],
    correctAnswer: '0x - 0y = 5',
    hints: [
      'Soát từng phương án xem hệ số gắn với x và hệ số gắn với y có cùng bằng 0 hay không.',
      'Nếu cả hệ số của x và hệ số của y đều bằng 0 thì phương trình không còn là phương trình bậc nhất hai ẩn.',
    ],
    commonMistake:
      'Nhầm rằng phương trình có một hệ số bằng 0 (như 0x - y = 3 hoặc x + 0y = -6) không phải phương trình bậc nhất hai ẩn.',
    parentGuide: {
      keyConcept:
        'Phương trình bậc nhất hai ẩn có dạng ax + by = c với a, b không đồng thời bằng 0.',
      guidingQuestion:
        'Con kiểm tra từng đáp án xem chỗ nào cả x và y đều bị nhân với 0 nhé?',
    },
  },
  {
    id: 'week1-16-c1-d1-tn2',
    subject: 'toan',
    topic: 'Phương trình bậc nhất hai ẩn',
    weekSpan: 1,
    sourceRef: 'Tuần 1 • [CĐOT] Bộ Đề Theo Chương Toán 9 - 7991 - Chương 1, Đề số 1, TN Câu 2',
    phaseOneCheck:
      'Đối chiếu phương trình x + 2y - 1 = 0 với dạng chuẩn ax + by = c.',
    phaseOneQuickCheck: {
      question: 'Nếu chuyển -1 từ vế trái sang vế phải thì vế phải của phương trình là bao nhiêu?',
      options: ['-1', '1', '0'],
      correctAnswer: '1',
    },
    errorCategory: 'trap_condition',
    prompt:
      'Hệ số a, b, c tương ứng của phương trình bậc nhất hai ẩn x + 2y - 1 = 0 là:',
    options: [
      'a = 1; b = 1; c = 0',
      'a = 1; b = 2; c = -1',
      'a = 1; b = 2; c = 1',
      'a = 1; b = -2; c = 1',
    ],
    correctAnswer: 'a = 1; b = 2; c = -1',
    hints: [
      'Chuyển -1 sang vế phải để viết phương trình về dạng ax + by = c.',
      'Đọc lần lượt hệ số đi kèm x, hệ số đi kèm y và giá trị ở vế phải.',
    ],
    commonMistake:
      'Quên đổi dấu khi chuyển -1 sang vế phải nên dễ nhầm thành c = 1 thay vì c = -1.',
    parentGuide: {
      keyConcept:
        'Khi chuyển vế một hạng tử, cần đổi dấu hạng tử đó để xác định đúng hệ số tự do c.',
      guidingQuestion:
        'Từ x + 2y - 1 = 0, viết lại thành x + 2y = ... thì con thấy c bằng mấy?',
    },
  },
  {
    id: 'week1-16-c1-d1-tl3',
    subject: 'toan',
    topic: 'Hệ phương trình thực tế',
    weekSpan: 2,
    sourceRef: 'Tuần 2 • [CĐOT] Bộ Đề Theo Chương Toán 9 - 7991 - Chương 1, Đề số 1, Tự luận Câu 3',
    phaseOneCheck:
      'Gọi đúng hai ẩn theo kế hoạch, đặt điều kiện và phân biệt số sản phẩm kế hoạch với thực tế.',
    phaseOneQuickCheck: {
      question: 'Nếu xí nghiệp I vượt mức 15% kế hoạch thì số sản phẩm thực tế tính theo x là biểu thức nào?',
      options: ['1,15x', '0,15x', 'x - 0,15x'],
      correctAnswer: '1,15x',
    },
    errorCategory: 'execution',
    prompt:
      'Hai xí nghiệp theo kế hoạch phải làm 300 sản phẩm. Trên thực tế, xí nghiệp I vượt mức 15%, xí nghiệp II vượt mức 10%, do đó cả hai xí nghiệp làm tổng cộng 336 sản phẩm. Hỏi theo kế hoạch mỗi xí nghiệp phải làm bao nhiêu sản phẩm?',
    options: [
      'Xí nghiệp I: 240 sản phẩm; Xí nghiệp II: 60 sản phẩm',
      'Xí nghiệp I: 200 sản phẩm; Xí nghiệp II: 100 sản phẩm',
      'Xí nghiệp I: 180 sản phẩm; Xí nghiệp II: 120 sản phẩm',
      'Xí nghiệp I: 220 sản phẩm; Xí nghiệp II: 80 sản phẩm',
    ],
    correctAnswer: 'Xí nghiệp I: 240 sản phẩm; Xí nghiệp II: 60 sản phẩm',
    hints: [
      'Gọi x, y lần lượt là số sản phẩm xí nghiệp I và xí nghiệp II phải làm theo kế hoạch (điều kiện phù hợp). Lập phương trình tổng kế hoạch bằng 300.',
      'Biểu diễn số sản phẩm thực tế của xí nghiệp I (115% của x) và xí nghiệp II (110% của y) để lập phương trình tổng thực tế bằng 336.',
    ],
    commonMistake:
      'Lấy 15%x và 10%y cộng lại rồi cho bằng 336 (nhầm phần vượt mức với tổng sản phẩm thực tế).',
    parentGuide: {
      keyConcept:
        'Vượt mức p% so với kế hoạch nghĩa là thực tế bằng (100% + p%) kế hoạch.',
      guidingQuestion:
        'Con thử kiểm tra xem với x = 240 và y = 60, tổng kế hoạch và tổng thực tế có khớp 300 và 336 không?',
    },
  },
];
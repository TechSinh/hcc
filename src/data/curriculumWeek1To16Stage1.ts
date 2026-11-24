export interface BoThachConGiaiQuestion {
  id: string;
  subject: 'toan' | 'van';
  weekRange: '1-16';
  weekHint: number;
  stageIndex: number;
  sourceRef: string;
  title: string;
  prompt: string;
  options?: string[];
  answerKey: string;
  stepHints: string[];
  commonTraps: string[];
  parentGuideQuestion: string;
}

export const STAGE_1_QUESTIONS_WEEK_1_16: BoThachConGiaiQuestion[] = [
  {
    id: 'toan9-c1-d1-q1',
    subject: 'toan',
    weekRange: '1-16',
    weekHint: 1,
    stageIndex: 1,
    sourceRef: '[CĐOT] BỘ ĐỀ THEO CHƯƠNG TOÁN 9 - 7991 - Chương 1, Đề số 1, Phần 1, Câu 1',
    title: 'Nhận diện phương trình bậc nhất hai ẩn',
    prompt:
      'Trong các phương trình sau, phương trình nào không phải là phương trình bậc nhất hai ẩn?',
    options: [
      'A. x + 2y = 1',
      'B. 0x - 0y = 5',
      'C. 0x - y = 3',
      'D. x + 0y = -6',
    ],
    answerKey: 'B',
    stepHints: [
      'Nhắc lại dạng tổng quát ax + by = c của phương trình bậc nhất hai ẩn và điều kiện đối với các hệ số a, b.',
      'Soát từng phương án để xem hệ số gắn với x và hệ số gắn với y có cùng bằng 0 hay không.',
    ],
    commonTraps: [
      'Nhầm lẫn rằng phương trình có hệ số của x hoặc y bằng 0 (như 0x - y = 3 hoặc x + 0y = -6) không phải phương trình bậc nhất hai ẩn.',
      'Chọn nhanh theo cảm giác mà chưa kiểm tra cả hai hệ số a và b.',
    ],
    parentGuideQuestion:
      'Con thử nêu điều kiện của a và b trong phương trình bậc nhất hai ẩn rồi chỉ ra phương án nào bị khuyết cả hai biến nhé?',
  },
  {
    id: 'toan9-c1-d1-q2',
    subject: 'toan',
    weekRange: '1-16',
    weekHint: 1,
    stageIndex: 1,
    sourceRef: '[CĐOT] BỘ ĐỀ THEO CHƯƠNG TOÁN 9 - 7991 - Chương 1, Đề số 1, Phần 1, Câu 2',
    title: 'Xác định hệ số a, b, c của phương trình bậc nhất hai ẩn',
    prompt:
      'Hệ số a, b, c tương ứng của phương trình bậc nhất hai ẩn x + 2y - 1 = 0 là:',
    options: [
      'A. a = 1; b = 1; c = 0',
      'B. a = 1; b = 2; c = -1',
      'C. a = 1; b = 2; c = 1',
      'D. a = 1; b = -2; c = 1',
    ],
    answerKey: 'B',
    stepHints: [
      'Đưa phương trình x + 2y - 1 = 0 về dạng ax + by = c.',
      'Đối chiếu đúng vị trí của hệ số đi với x, hệ số đi với y và hằng số ở vế phải.',
    ],
    commonTraps: [
      'Quên đổi dấu khi chuyển -1 từ vế trái sang vế phải, dẫn đến nhầm c = 1 thay vì c = -1.',
      'Đọc nhầm dấu của hệ số gắn với y.',
    ],
    parentGuideQuestion:
      'Khi chuyển -1 sang vế phải để được dạng ax + by = c, số ở vế phải mang dấu gì hả con?',
  },
  {
    id: 'toan9-c1-d1-tl3',
    subject: 'toan',
    weekRange: '1-16',
    weekHint: 2,
    stageIndex: 1,
    sourceRef: '[CĐOT] BỘ ĐỀ THEO CHƯƠNG TOÁN 9 - 7991 - Chương 1, Đề số 1, Phần 4 (Tự luận), Câu 3',
    title: 'Lập hệ phương trình giải bài toán năng suất / sản phẩm',
    prompt:
      'Hai xí nghiệp theo kế hoạch phải làm 300 sản phẩm. Trên thực tế, xí nghiệp I vượt mức 15%, xí nghiệp II vượt mức 10%, do đó cả hai xí nghiệp làm tổng cộng 336 sản phẩm. Tìm số sản phẩm mỗi xí nghiệp phải làm theo kế hoạch.',
    answerKey: 'Xí nghiệp I: 240 sản phẩm; Xí nghiệp II: 60 sản phẩm (theo kế hoạch)',
    stepHints: [
      'Gọi số sản phẩm xí nghiệp I và xí nghiệp II phải làm theo kế hoạch lần lượt là x, y (sản phẩm) cùng điều kiện của ẩn.',
      'Lập phương trình thứ nhất từ tổng sản phẩm kế hoạch là 300.',
      'Biểu diễn số sản phẩm thực tế (hoặc phần vượt mức) của từng xí nghiệp theo x, y để lập phương trình ứng với tổng 336 sản phẩm.',
    ],
    commonTraps: [
      'Nhầm lẫn giữa số sản phẩm thực tế (1,15x và 1,10y) với phần vượt mức (0,15x và 0,10y) khi viết phương trình thứ hai.',
      'Quên đối chiếu điều kiện của x, y sau khi giải hệ.',
    ],
    parentGuideQuestion:
      'Nếu xí nghiệp I vượt mức 15% kế hoạch thì lượng sản phẩm thực tế của xí nghiệp I tính theo x như thế nào?',
  },
];
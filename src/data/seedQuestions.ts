import { LearningItem } from '../types/learning';

export const SEED_ITEMS: LearningItem[] = [
  {
    id: 'toan9-pt-01',
    subject: 'toan',
    topic: 'Phương trình bậc nhất hai ẩn',
    sourceRef: 'Đề ôn chương 1 - Đề 1 - TN Câu 3',
    prompt: 'Cặp số nào là nghiệm của phương trình 2x - y - 1 = 0?',
    options: ['(0; 1)', '(1; 0)', '(1; 1)', '(-1; 0)'],
    correctAnswer: '(1; 1)',
    hints: [
      'Thay lần lượt giá trị x và y vào vế trái: 2x - y - 1.',
      'Cặp nghiệm đúng sẽ làm vế trái bằng 0.'
    ],
    commonMistake: 'Thay nhầm thứ tự x, y hoặc tính nhẩm sai dấu phép trừ.',
    parentGuide: {
      keyConcept: 'Cặp số (x0; y0) là nghiệm khi thay vào phương trình cho đẳng thức đúng.',
      guidingQuestion: 'Con thử thay x = 1 và y = 1 vào 2x - y - 1 xem kết quả ra bao nhiêu?'
    }
  },
  {
    id: 'toan9-hpt-02',
    subject: 'toan',
    topic: 'Hệ phương trình thực tế',
    sourceRef: 'Đề ôn chương 1 - Đề 2 - TN Câu 11',
    prompt:
      'Bài toán cổ: "Vừa gà vừa chó / Bó lại cho tròn / Ba mươi sáu con / Một trăm chân chẵn". Gọi x, y là số gà, số chó. Hệ phương trình nào đúng?',
    options: [
      'x + y = 36 và 2x + 2y = 100',
      'x + y = 100 và 2x + 4y = 36',
      'x + y = 36 và 2x + 4y = 100',
      '2x + 4y = 36 và x + y = 100'
    ],
    correctAnswer: 'x + y = 36 và 2x + 4y = 100',
    hints: [
      'Tổng số gà và chó là 36 con -> x + y = 36.',
      'Gà có 2 chân, chó có 4 chân -> tổng chân là 2x + 4y = 100.'
    ],
    commonMistake: 'Nhầm số chân của gà/chó hoặc đảo vế phải 36 và 100.',
    parentGuide: {
      keyConcept: 'Tách rõ 2 đại lượng: tổng số con và tổng số chân.',
      guidingQuestion: 'Một con chó có mấy chân, và tổng số chân trong bài là bao nhiêu?'
    }
  },
  {
    id: 'toan9-can-03',
    subject: 'toan',
    topic: 'Điều kiện xác định căn thức',
    sourceRef: 'Đề ôn chương 3 - Đề 1 - TN Câu 5',
    prompt: 'Điều kiện xác định của biểu thức căn(-12x + 5) là gì?',
    options: ['x <= 5/12', 'x < 5/12', 'x > 5/12', 'x >= 5/12'],
    correctAnswer: 'x <= 5/12',
    hints: [
      'Biểu thức trong căn bậc hai số học phải lớn hơn hoặc bằng 0: -12x + 5 >= 0.',
      'Chuyển vế và chia cho -12 thì nhớ đổi chiều bất phương trình.'
    ],
    commonMistake: 'Chia cho số âm (-12) nhưng không đổi chiều bất phương trình.',
    parentGuide: {
      keyConcept: 'Căn bậc hai số học xác định khi biểu thức dưới dấu căn >= 0.',
      guidingQuestion: 'Khi chia cả hai vế cho số âm -12, dấu bất đẳng thức sẽ đổi như thế nào?'
    }
  },
  {
    id: 'toan9-xs-04',
    subject: 'toan',
    topic: 'Xác suất đơn giản',
    sourceRef: 'Đề thi thử vào 10 (Giao Thanh) - TN Câu 7',
    prompt:
      'Gieo một con xúc xắc. Xác suất để mặt xuất hiện có số chấm là số nguyên tố bằng bao nhiêu?',
    options: ['1/6', '1/3', '1/2', '2/3'],
    correctAnswer: '1/2',
    hints: [
      'Các mặt có thể xảy ra là 1, 2, 3, 4, 5, 6 (6 khả năng).',
      'Các số nguyên tố trong dãy này là 2, 3, 5 (3 khả năng).'
    ],
    commonMistake: 'Tính nhầm số 1 là số nguyên tố hoặc đếm thiếu mặt 2.',
    parentGuide: {
      keyConcept: 'Số nguyên tố lớn hơn 1 và chỉ có 2 ước là 1 và chính nó.',
      guidingQuestion: 'Trong các số từ 1 đến 6, những số nào là số nguyên tố?'
    }
  },
  {
    id: 'van9-nlxh-01',
    subject: 'van',
    topic: 'Nghị luận xã hội: Giải pháp',
    sourceRef: 'Cẩm nang Ngữ văn lớp 9 - Nghị luận xã hội',
    prompt:
      'Trong bài nghị luận xã hội về "làm chủ thời gian và công nghệ", cách làm nào giúp phần Giải pháp đạt điểm cao và không bị chung chung?',
    options: [
      'Chỉ viết 1 câu kêu gọi mọi người cố gắng học tập chăm chỉ hơn',
      'Nêu rõ nhận thức cần đổi, hành động hằng ngày và cách kiểm soát cám dỗ công nghệ',
      'Kể thật nhiều ví dụ về việc dùng điện thoại mà không cần giải pháp',
      'Chép lại phần giải thích khái niệm ở mở bài'
    ],
    correctAnswer: 'Nêu rõ nhận thức cần đổi, hành động hằng ngày và cách kiểm soát cám dỗ công nghệ',
    hints: [
      'Tránh câu khẩu hiệu chung chung, thiếu hành động cụ thể.',
      'Gắn giải pháp với thói quen học tập và quản lý thiết bị hằng ngày.'
    ],
    commonMistake: 'Viết giải pháp chung chung, sáo rỗng, thiếu tính hành động thực tế.',
    parentGuide: {
      keyConcept: 'Giải pháp tốt phải trả lời được: làm gì, làm thế nào, tránh cám dỗ ra sao.',
      guidingQuestion: 'Nếu con viết giải pháp cho bạn học hay mải điện thoại, con sẽ khuyên làm gì đầu tiên?'
    }
  }
];
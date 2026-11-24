import { LearningItem } from '../types/learning';

export const SEED_ITEMS: LearningItem[] = [
  {
    id: 'toan9-pt-01',
    subject: 'toan',
    topic: 'Phương trình bậc nhất hai ẩn',
    sourceRef: 'Đề ôn chương 1 - Đề 1 - TN Câu 3',
    prompt: 'Cặp số nào sau đây là nghiệm của phương trình 2x - y - 1 = 0?',
    options: ['(0; 1)', '(1; 0)', '(1; 1)', '(-1; 0)'],
    correctAnswer: '(1; 1)',
    hints: [
      'Thay lần lượt giá trị x và y vào vế trái của biểu thức 2x - y - 1.',
      'Cặp số đúng sẽ làm cho giá trị vế trái bằng 0.'
    ],
    commonMistake: 'Thay nhầm thứ tự x và y hoặc nhầm dấu khi tính phép trừ.',
    parentGuide: {
      keyConcept: 'Cặp số (x0; y0) là nghiệm của phương trình khi thay vào làm hai vế bằng nhau.',
      guidingQuestion: 'Con thay x = 1 và y = 1 vào 2x - y - 1 trước rồi kiểm tra có bằng 0 không nhé?'
    }
  },
  {
    id: 'toan9-hpt-02',
    subject: 'toan',
    topic: 'Hệ phương trình thực tế',
    sourceRef: 'Đề ôn chương 1 - Đề 2 - TN Câu 11',
    prompt:
      'Bài toán cổ: "Vừa gà vừa chó / Bó lại cho tròn / Ba mươi sáu con / Một trăm chân chẵn". Gọi x, y lần lượt là số gà và số chó. Hệ phương trình nào thỏa mãn?',
    options: [
      'x + y = 36 và 2x + 2y = 100',
      'x + y = 100 và 2x + 4y = 36',
      'x + y = 36 và 2x + 4y = 100',
      '2x + 4y = 36 và x + y = 100'
    ],
    correctAnswer: 'x + y = 36 và 2x + 4y = 100',
    hints: [
      'Tổng số gà và chó là 36 con nên phương trình đầu tiên là x + y = 36.',
      'Mỗi con gà có 2 chân, mỗi con chó có 4 chân nên tổng số chân là 2x + 4y = 100.'
    ],
    commonMistake: 'Nhầm số chân gà/chó hoặc đảo nhầm số 36 và 100 ở vế phải.',
    parentGuide: {
      keyConcept: 'Tách riêng hai mối quan hệ: tổng số con (36) và tổng số chân (100).',
      guidingQuestion: 'Một con chó có mấy chân, và vế phải 100 tương ứng với đại lượng nào?'
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
      'Biểu thức dưới dấu căn bậc hai số học phải lớn hơn hoặc bằng 0: -12x + 5 >= 0.',
      'Chuyển vế và chia cả hai vế cho -12 thì nhớ đổi chiều bất phương trình.'
    ],
    commonMistake: 'Chia cho số âm (-12) nhưng quên đổi chiều bất phương trình.',
    parentGuide: {
      keyConcept: 'Căn bậc hai số học xác định khi biểu thức dưới dấu căn lớn hơn hoặc bằng 0.',
      guidingQuestion: 'Khi chia cả hai vế bất phương trình cho số âm -12, dấu >= đổi thành gì?'
    }
  },
  {
    id: 'toan9-xs-04',
    subject: 'toan',
    topic: 'Xác suất đơn giản',
    sourceRef: 'Đề thi thử vào 10 (Giao Thanh) - TN Câu 7',
    prompt:
      'Gieo một con xúc xắc. Xác suất để xuất hiện mặt có số chấm là số nguyên tố bằng bao nhiêu?',
    options: ['1/6', '1/3', '1/2', '2/3'],
    correctAnswer: '1/2',
    hints: [
      'Các mặt có thể xảy ra trên xúc xắc là 1, 2, 3, 4, 5, 6 (gồm 6 kết quả).',
      'Các số nguyên tố trong dãy này là 2, 3, 5 (gồm 3 kết quả thuận lợi).'
    ],
    commonMistake: 'Tính nhầm số 1 là số nguyên tố hoặc đếm thiếu/dư số kết quả.',
    parentGuide: {
      keyConcept: 'Xác suất của biến cố = (Số kết quả thuận lợi) / (Tổng số kết quả có thể xảy ra).',
      guidingQuestion: 'Trong các số 1, 2, 3, 4, 5, 6, con liệt kê các số nguyên tố giúp bố/mẹ?'
    }
  },
  {
    id: 'toan9-xs-05',
    subject: 'toan',
    topic: 'Không gian mẫu phép thử',
    sourceRef: 'Đề thi thử vào 10 (Bình Hòa) - TN Câu 7',
    prompt:
      'Gieo một con xúc xắc cân đối đồng chất một lần. Không gian mẫu của phép thử có số phần tử là bao nhiêu?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '6',
    hints: [
      'Một con xúc xắc thông thường có 6 mặt đánh số từ 1 đến 6.',
      'Mỗi lần gieo 1 lần có thể cho ra 1 trong 6 mặt này.'
    ],
    commonMistake: 'Nhầm lẫn giữa số chấm lớn nhất (6) với số phần tử hoặc đếm thiếu mặt.',
    parentGuide: {
      keyConcept: 'Không gian mẫu là tập hợp tất cả các kết quả có thể xảy ra của phép thử.',
      guidingQuestion: 'Gieo một con xúc xắc 1 lần thì có thể ra những mặt nào?'
    }
  },
  {
    id: 'van9-nlxh-01',
    subject: 'van',
    topic: 'Nghị luận xã hội: Giải pháp',
    sourceRef: 'Cẩm nang Ngữ văn lớp 9 - Nghị luận xã hội',
    prompt:
      'Trong bài nghị luận xã hội về "làm chủ thời gian và công nghệ", cách làm nào giúp phần Giải pháp cụ thể, thuyết phục và tránh sáo rỗng?',
    options: [
      'Chỉ viết một câu kêu gọi mọi người chăm chỉ học tập hơn',
      'Nêu rõ nhận thức cần đổi, hành động hằng ngày và cách kiểm soát cám dỗ công nghệ',
      'Kể lại chuyện sử dụng điện thoại mà không nêu giải pháp',
      'Chép nguyên văn phần giải thích khái niệm ở mở bài'
    ],
    correctAnswer: 'Nêu rõ nhận thức cần đổi, hành động hằng ngày và cách kiểm soát cám dỗ công nghệ',
    hints: [
      'Tránh viết khẩu hiệu chung chung không gắn với việc làm cụ thể.',
      'Đảm bảo đủ 3 ý: đổi nhận thức, hành động hằng ngày và kiểm soát cám dỗ.'
    ],
    commonMistake: 'Viết giải pháp chung chung, thiếu hành động cụ thể gắn với đời sống.',
    parentGuide: {
      keyConcept: 'Phần giải pháp cần chỉ rõ: thay đổi nhận thức gì, làm gì hằng ngày, kiểm soát cám dỗ ra sao.',
      guidingQuestion: 'Nếu con tư vấn cho một bạn hay mải điện thoại, bước làm cụ thể đầu tiên là gì?'
    }
  },
  {
    id: 'van9-dh-02',
    subject: 'van',
    topic: 'Đọc hiểu: Bám ngữ liệu & ý nghĩa',
    sourceRef: 'Cẩm nang Ngữ văn lớp 9 - Đọc hiểu',
    prompt:
      'Khi làm câu hỏi Đọc hiểu về ý nghĩa một hình ảnh hoặc biện pháp tu từ trong đoạn trích, bước đầu tiên học sinh nên làm là gì?',
    options: [
      'Đoán ý nhanh theo cảm tính mà không nhìn lại ngữ liệu',
      'Chỉ ra đúng từ ngữ/hình ảnh trong ngữ liệu rồi mới phân tích tác dụng và thông điệp',
      'Viết thật dài để ăn điểm cảm xúc dù lạc ý câu hỏi',
      'Bỏ qua câu hỏi phụ để chỉ trả lời câu cuối'
    ],
    correctAnswer: 'Chỉ ra đúng từ ngữ/hình ảnh trong ngữ liệu rồi mới phân tích tác dụng và thông điệp',
    hints: [
      'Mọi nhận xét đọc hiểu đều phải xuất phát từ ngữ liệu đã cho.',
      'Sau khi chỉ đúng ngữ liệu mới nêu tác dụng biểu đạt và bài học/thông điệp.'
    ],
    commonMistake: 'Trả lời lan man theo cảm tính, không bám vào từ ngữ/hình ảnh trong ngữ liệu.',
    parentGuide: {
      keyConcept: 'Bám sát ngữ liệu -> nêu tác dụng/ý nghĩa -> liên hệ thông điệp đúng trọng tâm câu hỏi.',
      guidingQuestion: 'Con hãy chỉ cho bố/mẹ từ ngữ hoặc hình ảnh nào trong đoạn trích làm nổi bật ý này?'
    }
  }
];
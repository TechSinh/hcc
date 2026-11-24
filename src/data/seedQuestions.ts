export type Subject = 'toan' | 'van';

export type ErrorCategory = 'concept' | 'trap_condition' | 'execution';

export interface ParentGuide {
  keyConcept: string;
  guidingQuestion: string;
}

export interface PhaseOneQuickCheck {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface LearningItem {
  id: string;
  subject: Subject;
  topic: string;
  weekSpan: number; // Mốc tuần học tích lũy (<= 16 tuần cho các kèo cốt lõi)
  sourceRef: string;
  phaseOneCheck: string;
  phaseOneQuickCheck: PhaseOneQuickCheck;
  errorCategory: ErrorCategory;
  prompt: string;
  options: string[];
  correctAnswer: string;
  hints: string[];
  commonMistake: string;
  parentGuide: ParentGuide;
}

export interface MistakeRecord {
  itemId: string;
  subject: Subject;
  topic: string;
  sourceRef: string;
  errorCategory: ErrorCategory;
  commonMistake: string;
  guidingQuestion: string;
  wrongCount: number;
}

export interface ExamFormulaCard {
  id: string;
  subject: Subject;
  topic: string;
  weekSpan: number;
  weightNote: string;
  coreFormula: string;
  transitionTip: string;
}

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  concept: 'Nền tảng khái niệm / quy tắc',
  trap_condition: 'Bẫy điều kiện / ngữ liệu / đơn vị',
  execution: 'Thao tác tính toán / diễn đạt',
};

export const EXAM_FORMULA_CARDS: ExamFormulaCard[] = [
  {
    id: 'fm-can',
    subject: 'toan',
    topic: 'Căn thức bậc hai & bất phương trình',
    weekSpan: 12,
    weightNote: 'Mốc 12 tuần • Trọng tâm nền tảng vào lớp 10',
    coreFormula: 'Căn(A) xác định khi A >= 0; chia cho số âm thì đổi chiều bất đẳng thức.',
    transitionTip: 'Lên cấp 3 luôn phải đặt điều kiện xác định trước mọi phép biến đổi.',
  },
  {
    id: 'fm-hpt',
    subject: 'toan',
    topic: 'Giải bài toán bằng cách lập PT / hệ PT',
    weekSpan: 6,
    weightNote: 'Mốc 6 tuần • Trọng tâm chương đầu Lớp 9',
    coreFormula: 'Gọi ẩn kèm đơn vị & điều kiện -> lập 2 phương trình theo 2 đại lượng -> đối chiếu nghiệm.',
    transitionTip: 'Rèn thói quen mô hình hóa bài toán thực tế thành phương trình/hệ phương trình.',
  },
  {
    id: 'fm-xs',
    subject: 'toan',
    topic: 'Thống kê & Xác suất biến cố',
    weekSpan: 16,
    weightNote: 'Mốc 16 tuần • Rèn đếm kết quả thuận lợi & không gian mẫu',
    coreFormula: 'P(A) = n(A) / n(Omega); chú ý số 1 không phải là số nguyên tố.',
    transitionTip: 'Đếm chính xác không gian mẫu giúp tránh mất điểm ở các câu xác suất cấp 3.',
  },
  {
    id: 'fm-hh',
    subject: 'toan',
    topic: 'Hình phẳng & Hình khối thực tiễn',
    weekSpan: 18,
    weightNote: 'Mốc mở rộng sau 16 tuần • Dành khi học tới phần này',
    coreFormula: 'S_vanh_khuyen = pi * (R1^2 - R2^2); S_xq_tru = 2 * pi * r * h.',
    transitionTip: 'Vẽ hình đúng, phân biệt rõ bán kính và đường kính trước khi áp dụng công thức.',
  },
  {
    id: 'fm-van-nlxh',
    subject: 'van',
    topic: 'Nghị luận xã hội lớp 9: Giải pháp hành động',
    weekSpan: 10,
    weightNote: 'Mốc 10 tuần • Trọng tâm kỹ năng viết nghị luận xã hội',
    coreFormula: 'Giải pháp thuyết phục = Đổi nhận thức + Hành động hằng ngày cụ thể + Kiểm soát cám dỗ.',
    transitionTip: 'Lên cấp 3 viết nghị luận cần lập luận chặt chẽ, dẫn chứng thực tế và tránh sáo rỗng.',
  },
  {
    id: 'fm-van-dh',
    subject: 'van',
    topic: 'Đọc hiểu & Nghị luận văn học lớp 9',
    weekSpan: 16,
    weightNote: 'Mốc 16 tuần • Bám ngữ liệu, luận điểm & dẫn chứng',
    coreFormula: 'Đọc hiểu: Chỉ đúng từ ngữ/hình ảnh trong ngữ liệu -> Nêu tác dụng -> Rút ra thông điệp.',
    transitionTip: 'Giữ thói quen đọc kỹ câu hỏi, trả lời đúng trọng tâm và có dẫn chứng chuẩn xác.',
  },
];

export const CORE_SEED_ITEMS: LearningItem[] = [
  {
    id: 'toan9-pt-01',
    subject: 'toan',
    topic: 'Phương trình bậc nhất hai ẩn',
    weekSpan: 2,
    sourceRef: 'Tuần 1-2 • Đề ôn chương 1 - Đề 1 - TN Câu 3',
    phaseOneCheck: 'Xác định tọa độ (x; y) của từng cặp số và thay đúng vị trí vào 2x - y - 1.',
    phaseOneQuickCheck: {
      question: 'Với cặp số (1; 1), giá trị nào được thay vào x và y?',
      options: ['x = 1, y = 1', 'x = 1, y = 0', 'x = 0, y = 1'],
      correctAnswer: 'x = 1, y = 1',
    },
    errorCategory: 'execution',
    prompt: 'Cặp số nào sau đây là nghiệm của phương trình 2x - y - 1 = 0?',
    options: ['(0; 1)', '(1; 0)', '(1; 1)', '(-1; 0)'],
    correctAnswer: '(1; 1)',
    hints: [
      'Thay lần lượt giá trị x và y vào vế trái của biểu thức 2x - y - 1.',
      'Cặp số đúng sẽ làm cho giá trị vế trái bằng 0.',
    ],
    commonMistake: 'Thay nhầm thứ tự x và y hoặc nhầm dấu khi tính phép trừ.',
    parentGuide: {
      keyConcept: 'Cặp số (x0; y0) là nghiệm của phương trình khi thay vào làm hai vế bằng nhau.',
      guidingQuestion: 'Con thay x = 1 và y = 1 vào 2x - y - 1 trước rồi kiểm tra có bằng 0 không nhé?',
    },
  },
  {
    id: 'toan9-hpt-02',
    subject: 'toan',
    topic: 'Hệ phương trình thực tế',
    weekSpan: 6,
    sourceRef: 'Tuần 5-6 • Đề ôn chương 1 - Đề 2 - TN Câu 11',
    phaseOneCheck: 'Tách riêng 2 đại lượng ở đề bài: tổng số con (36) và tổng số chân (100).',
    phaseOneQuickCheck: {
      question: 'Phương trình biểu diễn tổng số chân gà (2 chân/con) và chó (4 chân/con) là gì?',
      options: ['2x + 4y = 100', 'x + y = 100', '2x + 2y = 36'],
      correctAnswer: '2x + 4y = 100',
    },
    errorCategory: 'trap_condition',
    prompt:
      'Bài toán cổ: "Vừa gà vừa chó / Bó lại cho tròn / Ba mươi sáu con / Một trăm chân chẵn". Gọi x, y lần lượt là số gà và số chó. Hệ phương trình nào thỏa mãn?',
    options: [
      'x + y = 36 và 2x + 2y = 100',
      'x + y = 100 và 2x + 4y = 36',
      'x + y = 36 và 2x + 4y = 100',
      '2x + 4y = 36 và x + y = 100',
    ],
    correctAnswer: 'x + y = 36 và 2x + 4y = 100',
    hints: [
      'Tổng số gà và chó là 36 con nên phương trình đầu tiên là x + y = 36.',
      'Mỗi con gà có 2 chân, mỗi con chó có 4 chân nên tổng số chân là 2x + 4y = 100.',
    ],
    commonMistake: 'Nhầm số chân gà/chó hoặc đảo nhầm số 36 và 100 ở vế phải.',
    parentGuide: {
      keyConcept: 'Tách riêng hai mối quan hệ: tổng số con (36) và tổng số chân (100).',
      guidingQuestion: 'Một con chó có mấy chân, và vế phải 100 tương ứng với đại lượng nào?',
    },
  },
  {
    id: 'toan9-can-03',
    subject: 'toan',
    topic: 'Điều kiện xác định căn thức',
    weekSpan: 12,
    sourceRef: 'Tuần 11-12 • Đề ôn chương 3 - Đề 1 - TN Câu 5',
    phaseOneCheck: 'Đặt biểu thức dưới căn >= 0, sau đó chú ý dấu của hệ số nhân với x khi chuyển vế.',
    phaseOneQuickCheck: {
      question: 'Bất phương trình điều kiện xác định của căn(-12x + 5) là gì?',
      options: ['-12x + 5 >= 0', '-12x + 5 > 0', '-12x + 5 <= 0'],
      correctAnswer: '-12x + 5 >= 0',
    },
    errorCategory: 'trap_condition',
    prompt: 'Điều kiện xác định của biểu thức căn(-12x + 5) là gì?',
    options: ['x <= 5/12', 'x < 5/12', 'x > 5/12', 'x >= 5/12'],
    correctAnswer: 'x <= 5/12',
    hints: [
      'Biểu thức dưới dấu căn bậc hai số học phải lớn hơn hoặc bằng 0: -12x + 5 >= 0.',
      'Chuyển vế và chia cả hai vế cho -12 thì nhớ đổi chiều bất phương trình.',
    ],
    commonMistake: 'Chia cho số âm (-12) nhưng quên đổi chiều bất phương trình.',
    parentGuide: {
      keyConcept: 'Căn bậc hai số học xác định khi biểu thức dưới dấu căn lớn hơn hoặc bằng 0.',
      guidingQuestion: 'Khi chia cả hai vế bất phương trình cho số âm -12, dấu >= đổi thành gì?',
    },
  },
  {
    id: 'toan9-xs-04',
    subject: 'toan',
    topic: 'Xác suất đơn giản',
    weekSpan: 16,
    sourceRef: 'Tuần 15-16 • Đề thi thử vào 10 (Giao Thanh) - TN Câu 7',
    phaseOneCheck: 'Liệt kê đủ 6 kết quả của xúc xắc và kiểm tra tính nguyên tố của từng số.',
    phaseOneQuickCheck: {
      question: 'Trong các mặt từ 1 đến 6 của xúc xắc, những mặt nào là số nguyên tố?',
      options: ['2, 3, 5', '1, 2, 3, 5', '2, 4, 6'],
      correctAnswer: '2, 3, 5',
    },
    errorCategory: 'concept',
    prompt:
      'Gieo một con xúc xắc. Xác suất để xuất hiện mặt có số chấm là số nguyên tố bằng bao nhiêu?',
    options: ['1/6', '1/3', '1/2', '2/3'],
    correctAnswer: '1/2',
    hints: [
      'Các mặt có thể xảy ra trên xúc xắc là 1, 2, 3, 4, 5, 6 (gồm 6 kết quả).',
      'Các số nguyên tố trong dãy này là 2, 3, 5 (gồm 3 kết quả thuận lợi).',
    ],
    commonMistake: 'Tính nhầm số 1 là số nguyên tố hoặc đếm thiếu/dư số kết quả.',
    parentGuide: {
      keyConcept: 'Xác suất của biến cố = (Số kết quả thuận lợi) / (Tổng số kết quả có thể xảy ra).',
      guidingQuestion: 'Trong các số 1, 2, 3, 4, 5, 6, con liệt kê các số nguyên tố giúp bố/mẹ?',
    },
  },
  {
    id: 'toan9-pt-08',
    subject: 'toan',
    topic: 'Phương trình bậc nhất hai ẩn',
    weekSpan: 3,
    sourceRef: 'Tuần 2-3 • Đề ôn chương 1 - Kiểm tra nhận biết nghiệm',
    phaseOneCheck: 'Thay cả hoành độ x và tung độ y vào biểu thức vế trái, kiểm tra kết quả có bằng 0 không.',
    phaseOneQuickCheck: {
      question: 'Muốn kiểm tra cặp số (x0; y0) có là nghiệm của phương trình hay không ta làm gì?',
      options: [
        'Thay x = x0, y = y0 vào phương trình và kiểm tra hai vế',
        'Chỉ cần thay x = x0 vào là đủ',
        'Đổi dấu cả x0 và y0 rồi cộng lại',
      ],
      correctAnswer: 'Thay x = x0, y = y0 vào phương trình và kiểm tra hai vế',
    },
    errorCategory: 'execution',
    prompt: 'Cặp số nào sau đây KHÔNG là nghiệm của phương trình 3x - y = 5?',
    options: ['(2; 1)', '(3; 4)', '(1; -2)', '(0; 5)'],
    correctAnswer: '(0; 5)',
    hints: [
      'Tính giá trị 3x - y cho từng cặp số (x; y).',
      'Cặp nào cho kết quả khác 5 thì không là nghiệm.',
    ],
    commonMistake: 'Tính nhẩm 3*0 - 5 bị nhầm thành 5 thay vì -5.',
    parentGuide: {
      keyConcept: 'Nghiệm của phương trình bậc nhất hai ẩn là cặp số làm hai vế phương trình bằng nhau.',
      guidingQuestion: 'Với x = 0 và y = 5, biểu thức 3x - y bằng bao nhiêu so với 5?',
    },
  },
  {
    id: 'van9-nlxh-01',
    subject: 'van',
    topic: 'Nghị luận xã hội: Giải pháp',
    weekSpan: 10,
    sourceRef: 'Tuần 9-10 • Cẩm nang Ngữ văn lớp 9 - Nghị luận xã hội',
    phaseOneCheck: 'Nhận diện đúng trọng tâm "giải pháp" và kiểm tra tính cụ thể, không viết khẩu hiệu suông.',
    phaseOneQuickCheck: {
      question: 'Một giải pháp tốt trong nghị luận xã hội cần có yếu tố nào?',
      options: [
        'Nhận thức rõ + hành động cụ thể + kiểm soát cám dỗ',
        'Chỉ cần một câu hô hào chung chung',
        'Kể chuyện dài dòng không liên quan',
      ],
      correctAnswer: 'Nhận thức rõ + hành động cụ thể + kiểm soát cám dỗ',
    },
    errorCategory: 'concept',
    prompt:
      'Trong bài nghị luận xã hội về "làm chủ thời gian và công nghệ", cách làm nào giúp phần Giải pháp cụ thể, thuyết phục và tránh sáo rỗng?',
    options: [
      'Chỉ viết một câu kêu gọi mọi người chăm chỉ học tập hơn',
      'Nêu rõ nhận thức cần đổi, hành động hằng ngày và cách kiểm soát cám dỗ công nghệ',
      'Kể lại chuyện sử dụng điện thoại mà không nêu giải pháp',
      'Chép nguyên văn phần giải thích khái niệm ở mở bài',
    ],
    correctAnswer: 'Nêu rõ nhận thức cần đổi, hành động hằng ngày và cách kiểm soát cám dỗ công nghệ',
    hints: [
      'Tránh viết khẩu hiệu chung chung không gắn với việc làm cụ thể.',
      'Đảm bảo đủ 3 ý: đổi nhận thức, hành động hằng ngày và kiểm soát cám dỗ.',
    ],
    commonMistake: 'Viết giải pháp chung chung, thiếu hành động cụ thể gắn với đời sống.',
    parentGuide: {
      keyConcept: 'Phần giải pháp cần chỉ rõ: thay đổi nhận thức gì, làm gì hằng ngày, kiểm soát cám dỗ ra sao.',
      guidingQuestion: 'Nếu con tư vấn cho một bạn hay mải điện thoại, bước làm cụ thể đầu tiên là gì?',
    },
  },
  {
    id: 'van9-dh-02',
    subject: 'van',
    topic: 'Đọc hiểu: Bám ngữ liệu & ý nghĩa',
    weekSpan: 6,
    sourceRef: 'Tuần 5-6 • Cẩm nang Ngữ văn lớp 9 - Đọc hiểu',
    phaseOneCheck: 'Quay lại đối chiếu trực tiếp từ ngữ/hình ảnh trong ngữ liệu trước khi nhận xét ý nghĩa.',
    phaseOneQuickCheck: {
      question: 'Khi làm câu hỏi Đọc hiểu về hình ảnh hoặc biện pháp tu từ, bước đầu là gì?',
      options: [
        'Chỉ đúng từ ngữ/hình ảnh trong ngữ liệu rồi nêu tác dụng',
        'Đoán ý theo cảm tính không cần nhìn ngữ liệu',
        'Viết thật dài cho đủ dòng dù lạc ý',
      ],
      correctAnswer: 'Chỉ đúng từ ngữ/hình ảnh trong ngữ liệu rồi nêu tác dụng',
    },
    errorCategory: 'trap_condition',
    prompt:
      'Khi làm câu hỏi Đọc hiểu về ý nghĩa một hình ảnh hoặc biện pháp tu từ trong đoạn trích, bước đầu tiên học sinh nên làm là gì?',
    options: [
      'Đoán ý nhanh theo cảm tính mà không nhìn lại ngữ liệu',
      'Chỉ ra đúng từ ngữ/hình ảnh trong ngữ liệu rồi mới phân tích tác dụng và thông điệp',
      'Viết thật dài để ăn điểm cảm xúc dù lạc ý câu hỏi',
      'Bỏ qua câu hỏi phụ để chỉ trả lời câu cuối',
    ],
    correctAnswer: 'Chỉ ra đúng từ ngữ/hình ảnh trong ngữ liệu rồi mới phân tích tác dụng và thông điệp',
    hints: [
      'Mọi nhận xét đọc hiểu đều phải xuất phát từ ngữ liệu đã cho.',
      'Sau khi chỉ đúng ngữ liệu mới nêu tác dụng biểu đạt và bài học/thông điệp.',
    ],
    commonMistake: 'Trả lời lan man theo cảm tính, không bám vào từ ngữ/hình ảnh trong ngữ liệu.',
    parentGuide: {
      keyConcept: 'Bám sát ngữ liệu -> nêu tác dụng/ý nghĩa -> liên hệ thông điệp đúng trọng tâm câu hỏi.',
      guidingQuestion: 'Con hãy chỉ cho bố/mẹ từ ngữ hoặc hình ảnh nào trong đoạn trích làm nổi bật ý này?',
    },
  },
  {
    id: 'van9-nlvh-03',
    subject: 'van',
    topic: 'Nghị luận văn học: Bám chủ đề & luận điểm',
    weekSpan: 14,
    sourceRef: 'Tuần 13-14 • Cẩm nang Ngữ văn lớp 9 - Nghị luận văn học',
    phaseOneCheck: 'Phân biệt giữa "kể lại sự việc" và "lập luận phân tích gắn dẫn chứng làm rõ vấn đề".',
    phaseOneQuickCheck: {
      question: 'Nghị luận văn học cần tránh lỗi nào phổ biến nhất?',
      options: [
        'Kể lể sự việc dài dòng thay cho phân tích luận điểm',
        'Có dẫn chứng gắn với vấn đề nghị luận',
        'Trả lời đúng trọng tâm câu hỏi',
      ],
      correctAnswer: 'Kể lể sự việc dài dòng thay cho phân tích luận điểm',
    },
    errorCategory: 'concept',
    prompt:
      'Khi viết đoạn/bài nghị luận văn học lớp 9, điều nào giúp lập luận chặt chẽ và không bị lan man, kể lể sự việc?',
    options: [
      'Kể tóm tắt toàn bộ cốt truyện từ đầu đến cuối rồi mới thêm vài câu cảm nhận',
      'Xác định rõ vấn đề nghị luận, triển khai luận điểm sáng rõ và bám sát dẫn chứng trong tác phẩm',
      'Dùng thật nhiều từ ngữ hoa mỹ nhưng không trả lời thẳng trọng tâm đề bài',
      'Chỉ nêu cảm xúc cá nhân mà không dẫn chi tiết từ tác phẩm',
    ],
    correctAnswer: 'Xác định rõ vấn đề nghị luận, triển khai luận điểm sáng rõ và bám sát dẫn chứng trong tác phẩm',
    hints: [
      'Nghị luận văn học cần phân tích, đánh giá chứ không kể lại cốt truyện thay cho lập luận.',
      'Mỗi luận điểm nên gắn với dẫn chứng phù hợp và quay về làm rõ vấn đề đề bài yêu cầu.',
    ],
    commonMistake: 'Kể lể sự việc dài dòng thay vì phân tích, hoặc đưa dẫn chứng rời rạc thiếu nhận xét.',
    parentGuide: {
      keyConcept: 'Luận điểm rõ ràng + dẫn chứng đúng chỗ + phân tích gắn với chủ đề/ý nghĩa tác phẩm.',
      guidingQuestion: 'Vấn đề chính đề bài yêu cầu làm sáng tỏ là gì, và chi tiết nào trong bài chứng minh rõ nhất?',
    },
  },
  {
    id: 'van9-on-04',
    subject: 'van',
    topic: 'Ôn tập tổng hợp: Phân bổ thời gian làm bài',
    weekSpan: 16,
    sourceRef: 'Tuần 15-16 • Cẩm nang Ngữ văn lớp 9 - Phương pháp ôn luyện',
    phaseOneCheck: 'Đánh giá tính bền vững của phương pháp ôn luyện thay vì dựa vào học tủ.',
    phaseOneQuickCheck: {
      question: 'Vì sao ôn Ngữ văn lớp 9 không nên học tủ theo văn mẫu?',
      options: [
        'Ngữ liệu và cách hỏi có thể đổi góc nên cần nắm phương pháp làm bài',
        'Vì không cần đọc kỹ đề bài khi làm kiểm tra',
        'Vì chỉ cần học vẹt một đoạn cho mọi đề',
      ],
      correctAnswer: 'Ngữ liệu và cách hỏi có thể đổi góc nên cần nắm phương pháp làm bài',
    },
    errorCategory: 'execution',
    prompt:
      'Trong quá trình ôn luyện Ngữ văn lớp 9 chuẩn bị thi vào lớp 10, cách rèn luyện nào giúp học sinh giữ sự chủ động và tránh học tủ?',
    options: [
      'Chỉ học thuộc lòng vài đoạn mẫu có sẵn rồi áp dụng máy móc cho mọi đề',
      'Rèn vững kỹ năng đọc hiểu, dàn ý từng dạng nghị luận và tự kiểm soát lỗi diễn đạt qua từng bài luyện',
      'Bỏ qua phần luyện viết đoạn/bài vì chỉ cần nhớ ý chính',
      'Làm đề dồn dập sát ngày thi mà không rà lại lỗi sai cũ',
    ],
    correctAnswer: 'Rèn vững kỹ năng đọc hiểu, dàn ý từng dạng nghị luận và tự kiểm soát lỗi diễn đạt qua từng bài luyện',
    hints: [
      'Học tủ dễ mất điểm khi ngữ liệu hoặc câu hỏi đổi góc tiếp cận.',
      'Nắm chắc thao tác làm bài giúp học sinh tự xử lý được nhiều dạng đề khác nhau.',
    ],
    commonMistake: 'Học tủ, viết vội thiếu kiểm soát lỗi diễn đạt và lặp từ.',
    parentGuide: {
      keyConcept: 'Nắm phương pháp làm bài từng dạng + tự rà soát lỗi diễn đạt để ứng biến linh hoạt.',
      guidingQuestion: 'Sau khi làm xong một phần luyện tập, con thường tự kiểm tra lại ý nào trước tiên?',
    },
  },
];

export const EXTRA_MOCK_EXAM_ITEMS: LearningItem[] = [
  {
    id: 'toan9-xs-05',
    subject: 'toan',
    topic: 'Không gian mẫu phép thử',
    weekSpan: 16,
    sourceRef: 'Tuần 16 • Đề thi thử vào 10 (Bình Hòa) - TN Câu 7',
    phaseOneCheck: 'Xác định phép thử là gieo 1 xúc xắc 1 lần và đếm toàn bộ kết quả có thể xảy ra.',
    phaseOneQuickCheck: {
      question: 'Các mặt có thể xuất hiện khi gieo 1 xúc xắc 1 lần gồm những số nào?',
      options: ['1, 2, 3, 4, 5, 6', '2, 4, 6', '1, 3, 5'],
      correctAnswer: '1, 2, 3, 4, 5, 6',
    },
    errorCategory: 'concept',
    prompt:
      'Gieo một con xúc xắc cân đối đồng chất một lần. Không gian mẫu của phép thử có số phần tử là bao nhiêu?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '6',
    hints: [
      'Một con xúc xắc thông thường có 6 mặt đánh số từ 1 đến 6.',
      'Mỗi lần gieo 1 lần có thể cho ra 1 trong 6 mặt này.',
    ],
    commonMistake: 'Nhầm lẫn giữa số chấm lớn nhất (6) với số phần tử hoặc đếm thiếu mặt.',
    parentGuide: {
      keyConcept: 'Không gian mẫu là tập hợp tất cả các kết quả có thể xảy ra của phép thử.',
      guidingQuestion: 'Gieo một con xúc xắc 1 lần thì có thể ra những mặt nào?',
    },
  },
  {
    id: 'toan9-hh-06',
    subject: 'toan',
    topic: 'Hình vành khuyên',
    weekSpan: 18,
    sourceRef: 'Mở rộng sau 16 tuần • Đề thi thử vào 10 (Giao Lạc)',
    phaseOneCheck: 'Kiểm tra bán kính R1, R2 (nếu cho đường kính thì chia 2) và phép trừ diện tích hai hình tròn.',
    phaseOneQuickCheck: {
      question: 'Diện tích hình vành khuyên được tính bằng cách nào từ 2 đường tròn bán kính R1 > R2?',
      options: [
        'Lấy diện tích hình tròn lớn trừ diện tích hình tròn nhỏ',
        'Cộng diện tích hai hình tròn lại với nhau',
        'Lấy hiệu bán kính rồi bình phương',
      ],
      correctAnswer: 'Lấy diện tích hình tròn lớn trừ diện tích hình tròn nhỏ',
    },
    errorCategory: 'trap_condition',
    prompt:
      'Với hình vành khuyên giới hạn bởi hai đường tròn có bán kính R1 > R2, công thức tính diện tích hình vành khuyên là gì?',
    options: [
      'S = pi * (R1 + R2)',
      'S = pi * (R1^2 - R2^2)',
      'S = 2 * pi * (R1 - R2)',
      'S = pi * (R1 - R2)^2',
    ],
    correctAnswer: 'S = pi * (R1^2 - R2^2)',
    hints: [
      'Diện tích hình vành khuyên bằng diện tích hình tròn lớn trừ diện tích hình tròn nhỏ.',
      'Diện tích mỗi hình tròn là pi * R^2, nhớ đổi từ đường kính sang bán kính trước khi bình phương.',
    ],
    commonMistake: 'Lấy hiệu bình phương nhầm thành bình phương của hiệu (R1 - R2)^2 hoặc quên chia 2 khi đề cho đường kính.',
    parentGuide: {
      keyConcept: 'S_vanh_khuyen = pi * (R1^2 - R2^2); nếu đề cho đường kính d thì r = d / 2.',
      guidingQuestion: 'Nếu đề cho đường kính đáy thì trước tiên con phải tìm bán kính bằng phép tính nào?',
    },
  },
  {
    id: 'toan9-hh-07',
    subject: 'toan',
    topic: 'Hình trụ trong thực tiễn',
    weekSpan: 19,
    sourceRef: 'Mở rộng sau 16 tuần • Đề thi thử vào 10 (Giao Thiện / Hồng Thuận)',
    phaseOneCheck: 'Phân biệt rõ "diện tích xung quanh" (chu vi đáy nhân chiều cao) với "thể tích".',
    phaseOneQuickCheck: {
      question: 'Diện tích xung quanh hình trụ được tính từ đại lượng nào của đáy?',
      options: ['Chu vi đáy nhân chiều cao h', 'Diện tích đáy nhân chiều cao h', 'Bình phương chiều cao h'],
      correctAnswer: 'Chu vi đáy nhân chiều cao h',
    },
    errorCategory: 'concept',
    prompt:
      'Một hình trụ có bán kính đáy r và chiều cao h. Công thức tính diện tích xung quanh của hình trụ là gì?',
    options: [
      'S_xq = pi * r^2 * h',
      'S_xq = 2 * pi * r * h',
      'S_xq = (1/3) * pi * r^2 * h',
      'S_xq = 4 * pi * r^2',
    ],
    correctAnswer: 'S_xq = 2 * pi * r * h',
    hints: [
      'Diện tích xung quanh hình trụ bằng chu vi đáy nhân với chiều cao.',
      'Chu vi hình tròn bán kính r là 2 * pi * r.',
    ],
    commonMistake: 'Nhầm công thức diện tích xung quanh (2 * pi * r * h) với thể tích hình trụ (pi * r^2 * h).',
    parentGuide: {
      keyConcept: 'S_xq = chu vi đáy * chiều cao = 2 * pi * r * h.',
      guidingQuestion: 'Chu vi đáy hình tròn bán kính r là gì, và nhân với chiều cao h ta được công thức nào?',
    },
  },
];

export const SEED_ITEMS: LearningItem[] = [...CORE_SEED_ITEMS, ...EXTRA_MOCK_EXAM_ITEMS];
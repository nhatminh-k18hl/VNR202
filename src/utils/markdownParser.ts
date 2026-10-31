/**
 * THẦN TỐC 1975 - BỘ ĐỌC & PARSE FILE CÂU HỎI MARKDOWN
 * Đọc file /public/questions.md và chuyển đổi thành mảng Question[]
 */

import { AnswerKey, Question, QuestionOptions } from '../types/game';

/**
 * Phân tích chuỗi văn bản Markdown chứa danh sách câu hỏi thành mảng Question[]
 * Định dạng hỗ trợ:
 * # Câu X: Nội dung câu hỏi...
 * - [ ] A. Phương án A
 * - [x] B. Phương án đúng
 * - [ ] C. Phương án C
 * - [ ] D. Phương án D
 * > Giải thích: Lời giải chi tiết...
 */
export function parseQuestionsMarkdown(markdownText: string): Question[] {
  if (!markdownText || !markdownText.trim()) {
    return [];
  }

  const questions: Question[] = [];
  const lines = markdownText.split(/\r?\n/);

  let currentId: number = 0;
  let currentQuestionText = '';
  let options: Partial<QuestionOptions> = {};
  let correctAnswer: AnswerKey = 'A';
  let explanation = '';
  let isParsingQuestion = false;

  const saveCurrentQuestion = () => {
    if (isParsingQuestion && currentQuestionText) {
      questions.push({
        id: currentId || questions.length + 1,
        text: currentQuestionText.trim(),
        options: {
          A: options.A || 'Phương án A',
          B: options.B || 'Phương án B',
          C: options.C || 'Phương án C',
          D: options.D || 'Phương án D',
        },
        correctAnswer: correctAnswer || 'A',
        explanation: explanation.trim() || 'Chưa có giải thích chi tiết cho câu hỏi này.',
      });
    }

    // Reset bộ đệm cho câu hỏi tiếp theo
    currentQuestionText = '';
    options = {};
    correctAnswer = 'A';
    explanation = '';
    isParsingQuestion = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Nhận diện tiêu đề câu hỏi: # Câu 1: hoặc ## Câu 1:
    const questionHeaderMatch = line.match(/^#{1,3}\s*C[âa]u\s*(\d+)[\s:.]+(.*)$/i);
    if (questionHeaderMatch) {
      saveCurrentQuestion();
      currentId = parseInt(questionHeaderMatch[1], 10);
      currentQuestionText = questionHeaderMatch[2].trim();
      isParsingQuestion = true;
      continue;
    }

    if (!isParsingQuestion) continue;

    // Nhận diện phương án: - [ ] A. hoặc - [x] B. hoặc - [X] C.
    const optionMatch = line.match(/^-\s*\[([ xX])\]\s*([A-Da-d])[\.:\)]\s*(.*)$/);
    if (optionMatch) {
      const isChecked = optionMatch[1].toLowerCase() === 'x';
      const optionLetter = optionMatch[2].toUpperCase() as AnswerKey;
      const optionContent = optionMatch[3].trim();

      options[optionLetter] = optionContent;
      if (isChecked) {
        correctAnswer = optionLetter;
      }
      continue;
    }

    // Nhận diện phần Giải thích: > Giải thích: ... hoặc > ...
    if (line.startsWith('>')) {
      const expContent = line.replace(/^>\s*(?:Gi[ảa]i\s*th[íi]ch:?)?\s*/i, '').trim();
      if (explanation) {
        explanation += ' ' + expContent;
      } else {
        explanation = expContent;
      }
      continue;
    }

    // Nếu là dòng text nối tiếp của tiêu đề câu hỏi (trước khi xuất hiện option đầu tiên)
    if (Object.keys(options).length === 0 && !line.startsWith('-') && !line.startsWith('>')) {
      if (line) {
        currentQuestionText += ' ' + line;
      }
    }
  }

  // Lưu câu hỏi cuối cùng còn trong buffer
  saveCurrentQuestion();

  return questions;
}

/**
 * Tải file questions.md từ thư mục public và parse thành danh sách câu hỏi
 * @param relativeUrl Đường dẫn tương đối (mặc định './questions.md' tương thích GitHub Pages)
 */
export async function fetchAndParseQuestions(relativeUrl: string = './questions.md'): Promise<Question[]> {
  try {
    const response = await fetch(relativeUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'text/plain, text/markdown, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Không thể nạp file câu hỏi (${response.status}: ${response.statusText})`);
    }

    const markdownText = await response.text();
    const parsedQuestions = parseQuestionsMarkdown(markdownText);

    if (parsedQuestions.length === 0) {
      console.warn(`[markdownParser] File ${relativeUrl} không chứa câu hỏi hợp lệ theo chuẩn "# Câu X".`);
    }

    return parsedQuestions;
  } catch (error) {
    console.error(`[markdownParser] Lỗi tải questions.md từ "${relativeUrl}":`, error);
    throw error;
  }
}

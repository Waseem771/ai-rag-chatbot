import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

/**
 * Extract text from uploaded file
 */
export async function extractTextFromFile(filePath) {
  try {
    let ext = path.extname(filePath).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      throw new Error('PDF support is temporarily unavailable. Please upload a .txt or .docx file instead.');
    } else if (ext === '.docx') {
      text = await extractFromDocx(filePath);
    } else if (ext === '.doc') {
      text = await extractFromDocx(filePath);
    } else if (ext === '.txt') {
      text = fs.readFileSync(filePath, 'utf-8');
    } else if (!ext || ext === '') {
      // No extension - try to read as text file first
      try {
        text = fs.readFileSync(filePath, 'utf-8');
        if (text.length > 0) {
          return text.trim();
        }
      } catch (e) {
        throw new Error('Could not read file as text');
      }
    } else {
      throw new Error('Unsupported file format: ' + ext);
    }

    return text.trim();
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

/**
 * Extract text from Word document (.docx or .doc)
 */
async function extractFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from Word document: ' + error.message);
  }
}

/**
 * Get file info
 */
export function getFileInfo(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    return {
      name: fileName,
      size: stats.size,
      type: path.extname(filePath).toLowerCase() || '.txt'
    };
  } catch (error) {
    throw new Error('Failed to get file info: ' + error.message);
  }
}
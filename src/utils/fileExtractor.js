import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

/**
 * Extract text from uploaded file (supports both file path and buffer)
 */
export async function extractTextFromFile(fileInput, mimeType, ext) {
  try {
    let text = '';

    // Determine extension if not provided
    if (!ext) {
      ext = typeof fileInput === 'string' ? path.extname(fileInput).toLowerCase() : '';
    }

    // Handle buffer input (from memory storage)
    if (Buffer.isBuffer(fileInput)) {
      if (ext === '.pdf') {
        throw new Error('PDF support is temporarily unavailable. Please upload a .txt or .docx file instead.');
      } else if (ext === '.docx' || ext === '.doc') {
        text = await extractFromDocxBuffer(fileInput);
      } else if (ext === '.txt' || !ext) {
        text = fileInput.toString('utf-8');
      } else {
        throw new Error('Unsupported file format: ' + ext);
      }
    }
    // Handle file path input (from disk storage)
    else if (typeof fileInput === 'string') {
      if (ext === '.pdf') {
        throw new Error('PDF support is temporarily unavailable. Please upload a .txt or .docx file instead.');
      } else if (ext === '.docx' || ext === '.doc') {
        text = await extractFromDocx(fileInput);
      } else if (ext === '.txt' || !ext) {
        text = fs.readFileSync(fileInput, 'utf-8');
      } else {
        throw new Error('Unsupported file format: ' + ext);
      }
    } else {
      throw new Error('Invalid file input');
    }

    return text.trim();
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

/**
 * Extract text from Word document buffer (.docx or .doc)
 */
async function extractFromDocxBuffer(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from Word document: ' + error.message);
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
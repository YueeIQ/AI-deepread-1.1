
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BookAnalysisResult, ChatMessage } from "../types";

// Schema for structured book analysis
const bookAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "书名" },
    author: { type: Type.STRING, description: "作者" },
    introduction: { type: Type.STRING, description: "全书内容简介，约300-500字。请概括全书的核心主题、写作背景、主要贡献以及适合的读者群体。" },
    coverImageDescription: { type: Type.STRING, description: "关于书籍封面的简短视觉风格描述（例如：极简主义风格，蓝色背景，金色几何图形），用于生成封面图。" },
    chapters: {
      type: Type.ARRAY,
      description: "严格按照书籍的原始目录结构进行解析，不要跳过或合并任何章节。",
      items: {
        type: Type.OBJECT,
        properties: {
          chapterTitle: { type: Type.STRING, description: "章节标题（请保持原书目录标题）" },
          summary: { type: Type.STRING, description: "该章节的详细深度摘要，需包含主要论证逻辑、关键案例和细节，内容要丰富详实，字数充足。" },
          corePoints: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "该章节的核心论点或事实列表。" 
          },
          novelInsights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "该章节中独特、反直觉、令人惊讶或极具启发性的新颖观点。" 
          },
          keyQuotes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "从该章节原文中摘录3-5段最能体现核心观点的原话（Original Text Quotes），便于读者直接阅读精彩原文。"
          }
        },
        required: ["chapterTitle", "summary", "corePoints", "novelInsights", "keyQuotes"]
      }
    },
    crossReferences: {
      type: Type.ARRAY,
      description: "分析书中最重要的10个核心思想，并将其与其他书籍进行对比。",
      items: {
        type: Type.OBJECT,
        properties: {
          mainIdea: { type: Type.STRING, description: "被分析的核心思想/观点。" },
          similarBooks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                bookTitle: { type: Type.STRING, description: "书名" },
                explanation: { type: Type.STRING, description: "详细阐述这本书如何表达了类似的观点。请不要只写一句话，要展开说明其理论背景、具体案例或逻辑相似性，字数在100字左右。" }
              }
            }
          },
          opposingBooks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                bookTitle: { type: Type.STRING, description: "书名" },
                explanation: { type: Type.STRING, description: "详细阐述这本书如何提出了相反或对立的观点。请不要只写一句话，要具体说明其反驳逻辑、对立视角或不同结论，字数在100字左右。" }
              }
            }
          }
        }
      }
    }
  },
  required: ["title", "author", "introduction", "chapters", "crossReferences"]
};

export const analyzeBook = async (
  mode: 'SEARCH' | 'PDF',
  inputValue: string | File
): Promise<BookAnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("未找到 API Key");

  const ai = new GoogleGenAI({ apiKey });
  
  // Use Pro model for deep analysis and large context
  const analysisModelId = "gemini-3-pro-preview"; 

  let contents: any;
  let tools: any[] | undefined = undefined;

  const basePrompt = `
    请担任我的专业书籍阅读助手。你的任务是用中文提供一份非常详尽、深度的书籍结构化分析。
    
    请严格遵循以下要求：
    1. **全书简介**：首先提供一份精彩的全书简介。
    2. **完整章节解析**：必须严格按照书籍的**原始目录**（Table of Contents）进行解析，**严禁跳过、省略或合并任何章节**。每一章都要单独分析。
       - **详实摘要**（Summary）：不要只是简单的概括，要包含作者的具体论证逻辑、关键案例和细节。
       - **核心原文摘录**（Key Quotes）：每一章必须摘录3-5段**原文**（直接引用书中的原话），这些原话应能最直接地体现该章的核心思想或精彩论述。
       - **新颖观点**（Novel Insights）：挖掘独特、反直觉或最具启发性的洞见。
    3. **跨书籍索引（Cross-Reference）**：提炼全书最重要的10个核心思想。针对每个思想，列出其他具有**相似观点**的书籍，以及具有**完全相反或对立观点**的书籍。
       **关键要求**：在解释关联（explanation）时，必须深入详尽。不要只说“观点类似”，而要具体解释“《某某书》通过XX案例/理论，也提出了类似的YY观点，但侧重于ZZ方面”。每条解释应是一段有深度的文字。
  `;

  if (mode === 'PDF') {
    if (!(inputValue instanceof File)) throw new Error("文件输入无效");
    
    // Convert File to Base64
    const base64Data = await fileToBase64(inputValue);
    contents = {
      parts: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data
          }
        },
        {
          text: `请阅读这本完整的书。${basePrompt}`
        }
      ]
    };
  } else {
    // Search Mode
    tools = [{ googleSearch: {} }];
    contents = {
      parts: [{
        text: `请搜索书籍 "${inputValue}"。通过阅读网络上详尽的摘要、书评、解读和深度分析文章，全面理解其内容。然后，${basePrompt}`
      }]
    };
  }

  // 1. Generate Text Analysis
  const response = await ai.models.generateContent({
    model: analysisModelId,
    contents: contents,
    config: {
      tools: tools,
      responseMimeType: "application/json",
      responseSchema: bookAnalysisSchema,
      thinkingConfig: { thinkingBudget: 4096 } 
    }
  });

  if (!response.text) {
    throw new Error("AI 未能生成响应。");
  }

  let result: BookAnalysisResult;
  try {
    result = JSON.parse(response.text) as BookAnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON", response.text);
    throw new Error("解析分析结果失败。");
  }

  // 2. Generate Cover Image using Imagen
  try {
    const coverPrompt = `A high quality, artistic book cover for the book "${result.title}" by ${result.author}. 
    Style description: ${result.coverImageDescription || 'Minimalist, elegant, award-winning design'}. 
    The cover should be visually striking, suitable for a digital library. No text overlays.`;
    
    const imageResponse = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: coverPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '3:4'
      }
    });

    const base64Image = imageResponse.generatedImages?.[0]?.image?.imageBytes;
    if (base64Image) {
      result.coverImageUrl = `data:image/jpeg;base64,${base64Image}`;
    }
  } catch (imageError) {
    console.warn("Cover generation failed, will use placeholder.", imageError);
    // Non-blocking error, we return the text result even if image fails
  }

  return result;
};

export const sendChatMessage = async (
  history: ChatMessage[], 
  newMessage: string, 
  bookContext: BookAnalysisResult | null
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("未找到 API Key");

  const ai = new GoogleGenAI({ apiKey });
  
  // Use Flash for faster chat response
  const modelId = "gemini-2.5-flash";

  const systemInstruction = `你是一位专业的文学和学术阅读助手。请始终使用中文回答。
  ${bookContext ? `你当前正在与用户讨论书籍《${bookContext.title}》（作者：${bookContext.author || '未知'}）。
  
  这是你对该书的深度分析数据：
  ${JSON.stringify(bookContext)}
  
  请利用上述上下文，深入、准确地回答用户关于这本书的问题。如果用户询问书中的具体细节、观点或逻辑，请引用书中的内容进行解答。` : ''}
  
  如果用户问的问题超出本书范围，请尝试联系本书的主题进行回答，或者作为一般性知识回答。
  回答要不仅有帮助，还要有洞察力，像一位博学的书友在交流。`;

  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: systemInstruction,
    },
    history: history.filter(h => h.role !== 'user' || h.text !== newMessage).map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "我无法生成回答。";
};

// Helper for File -> Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

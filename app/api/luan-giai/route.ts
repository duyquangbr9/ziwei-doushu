import { NextRequest, NextResponse } from 'next/server';

// Định nghĩa 12 Địa Chi
const BRANCHES = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

// Bảng ánh xạ tên cung từ chữ Hán sang tiếng Việt (Đã bao gồm cả '仆役')
const PALACE_VI: Record<string,string> = {
  '命宫':'Mệnh','兄弟':'Huynh Đệ','夫妻':'Phu Thê','子女':'Tử Nữ',
  '财帛':'Tài Bạch','疾厄':'Tật Ách','迁移':'Thiên Di','交友':'Giao Hữu',
  '仆役':'Giao Hữu','官禄':'Quan Lộc','田宅':'Điền Trạch','福德':'Phúc Đức','父母':'Phụ Mẫu'
};

// Bảng ánh xạ tên các sao
const STAR_VI: Record<string,string> = {
  '紫微':'Tử Vi','天机':'Thiên Cơ','太阳':'Thái Dương','武曲':'Vũ Khúc',
  '天同':'Thiên Đồng','廉贞':'Liêm Trinh','天府':'Thiên Phủ','太阴':'Thái Âm',
  '贪狼':'Tham Lang','巨门':'Cự Môn','天相':'Thiên Tướng','天梁':'Thiên Lương',
  '七杀':'Thất Sát','破军':'Phá Quân','左辅':'Tả Phụ','右弼':'Hữu Bật',
  '文昌':'Văn Xương','文曲':'Văn Khúc','天魁':'Thiên Khôi','天钺':'Thiên Việt',
  '禄存':'Lộc Tồn','天马':'Thiên Mã','擎羊':'Kình Dương','陀罗':'Đà La',
  '火星':'Hỏa Tinh','铃星':'Linh Tinh','地空':'Địa Không','地劫':'Địa Kiếp'
};

// Bảng ánh xạ Tứ Hóa
const SIHUA_VI: Record<string,string> = {
  '禄':'Lộc','权':'Quyền','科':'Khoa','忌':'Kỵ'
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { palaces, birthInfo, lunarInfo, wuxingJuName, mingGongBranch, shenGongBranch } = body;

    if (!palaces || !birthInfo || !lunarInfo) {
      return NextResponse.json({ success: false, error: 'Thiếu dữ liệu đầu vào' }, { status: 400 });
    }

    // Xử lý thông tin các cung thành chuỗi văn bản gửi cho AI
    const palaceDesc = palaces.map((p: any) => {
      const tenCung = PALACE_VI[p.name] || p.name;
      const sao = p.stars.map((s: any) => {
        const ten = STAR_VI[s.name] || s.name;
        const sihua = s.siHua ? `[${SIHUA_VI[s.siHua] || s.siHua}]` : '';
        return `${ten}${sihua}`;
      }).join(', ');
      const dx = p.daXianAge ? ` | Đại hạn: ${p.daXianAge[0]}-${p.daXianAge[1]}` : '';
      const isMing = p.branch === mingGongBranch ? ' [CUNG MỆNH]' : '';
      const isShen = p.branch === shenGongBranch ? ' [THÂN CUNG]' : '';
      return `- Cung ${tenCung} (${BRANCHES[p.branch]})${isMing}${isShen}${dx}: ${sao || 'không có sao chính'}`;
    }).join('\n');

    const prompt = `Bạn là chuyên gia Tử Vi Đẩu Số có 30 năm kinh nghiệm. Luận giải lá số sau bằng tiếng Việt, ngắn gọn nhưng sâu sắc.

THÔNG TIN LÁ SỐ:
- Dương lịch: ${birthInfo.year}/${birthInfo.month}/${birthInfo.day}
- Âm lịch: ${lunarInfo.lunarYear}/${lunarInfo.lunarMonth}/${lunarInfo.lunarDay}
- Ngũ hành cục: ${wuxingJuName}
- Mệnh cung: ${BRANCHES[mingGongBranch]}
- Thân cung: ${BRANCHES[shenGongBranch]}

CÁC CUNG:
${palaceDesc}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY chưa được cấu hình');
    }

    // THAY ĐỔI QUAN TRỌNG: Dùng Key Tiếng Anh không dấu để Schema chạy mượt 100% trên Gemini Free
    const responseSchema = {
      type: "OBJECT",
      properties: {
        tongQuat: { type: "STRING", description: "Tổng quát lá số, tính cách bản mệnh bằng tiếng Việt (3-4 câu)" },
        tinhDuyen: { type: "STRING", description: "Luận cung Phu Thê, tình duyên hôn nhân bằng tiếng Việt (2-3 câu)" },
        suNghiep: { type: "STRING", description: "Luận cung Quan Lộc, công danh sự nghiệp bằng tiếng Việt (2-3 câu)" },
        taiLoc: { type: "STRING", description: "Luận cung Tài Bạch, tiền tài vật chất bằng tiếng Việt (2-3 câu)" },
        daiHan: { type: "STRING", description: "Luận đại hạn hiện tại và vận hạn gần nhất bằng tiếng Việt (2-3 câu)" },
        cacCung: {
          type: "OBJECT",
          properties: {
            menh: { type: "STRING", description: "Luận đoán cung Mệnh bằng tiếng Việt" },
            phuThe: { type: "STRING", description: "Luận đoán cung Phu Thê bằng tiếng Việt" },
            quanLoc: { type: "STRING", description: "Luận đoán cung Quan Lộc bằng tiếng Việt" },
            taiBach: { type: "STRING", description: "Luận đoán cung Tài Bạch bằng tiếng Việt" },
            phucDuc: { type: "STRING", description: "Luận đoán cung Phúc Đức bằng tiếng Việt" },
            thienDi: { type: "STRING", description: "Luận đoán cung Thiên Di bằng tiếng Việt" },
            tuNu: { type: "STRING", description: "Luận đoán cung Tử Nữ bằng tiếng Việt" },
            tatAch: { type: "STRING", description: "Luận đoán cung Tật Ách bằng tiếng Việt" }
          },
          required: ["menh", "phuThe", "quanLoc", "taiBach", "phucDuc", "thienDi", "tuNu", "tatAch"]
        }
      },
      required: ["tongQuat", "tinhDuyen", "suNghiep", "taiLoc", "daiHan", "cacCung"]
    };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
            responseSchema: responseSchema 
          }
        })
      }
    );

    const geminiData = await geminiRes.json();
    console.log('Gemini Status:', geminiRes.status);

    if (!geminiRes.ok) {
      throw new Error(`Gemini API lỗi ${geminiRes.status}: ${geminiData.error?.message || JSON.stringify(geminiData)}`);
    }

    const candidate = geminiData.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
      throw new Error('Nội dung bị bộ lọc an toàn chặn.');
    }

    const rawText = candidate?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Mô hình không trả về dữ liệu.');
    }

    const parsed = JSON.parse(rawText.trim());

    // MAP LẠI KEY TIẾNG VIỆT để tương thích hoàn toàn với giao diện Front-end cũ của bạn
    const finalResult = {
      tongQuat: parsed.tongQuat,
      tinhDuyen: parsed.tinhDuyen,
      suNghiep: parsed.suNghiep,
      taiLoc: parsed.taiLoc,
      daiHan: parsed.daiHan,
      cacCung: {
        "Mệnh": parsed.cacCung?.menh || "",
        "Phu Thê": parsed.cacCung?.phuThe || "",
        "Quan Lộc": parsed.cacCung?.quanLoc || "",
        "Tài Bạch": parsed.cacCung?.taiBach || "",
        "Phúc Đức": parsed.cacCung?.phucDuc || "",
        "Thiên Di": parsed.cacCung?.thienDi || "",
        "Tử Nữ": parsed.cacCung?.tuNu || "",
        "Tật Ách": parsed.cacCung?.tatAch || ""
      }
    };

    return NextResponse.json({ success: true, data: finalResult });

  } catch (e: any) {
    console.error('luan-giai error:', e.message);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}

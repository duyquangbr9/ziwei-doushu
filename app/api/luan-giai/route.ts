import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const BRANCHES = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
const PALACE_VI: Record<string,string> = {
  '命宫':'Mệnh','兄弟':'Huynh Đệ','夫妻':'Phu Thê','子女':'Tử Nữ',
  '财帛':'Tài Bạch','疾厄':'Tật Ách','迁移':'Thiên Di','交友':'Giao Hữu',
  '官禄':'Quan Lộc','田宅':'Điền Trạch','福德':'Phúc Đức','父母':'Phụ Mẫu'
};
const STAR_VI: Record<string,string> = {
  '紫微':'Tử Vi','天机':'Thiên Cơ','太阳':'Thái Dương','武曲':'Vũ Khúc',
  '天同':'Thiên Đồng','廉贞':'Liêm Trinh','天府':'Thiên Phủ','太阴':'Thái Âm',
  '贪狼':'Tham Lang','巨门':'Cự Môn','天相':'Thiên Tướng','天梁':'Thiên Lương',
  '七杀':'Thất Sát','破军':'Phá Quân','左辅':'Tả Phụ','右弼':'Hữu Bật',
  '文昌':'Văn Xương','文曲':'Văn Khúc','天魁':'Thiên Khôi','天钺':'Thiên Việt',
  '禄存':'Lộc Tồn','天马':'Thiên Mã','擎羊':'Kình Dương','陀罗':'Đà La',
  '火星':'Hỏa Tinh','铃星':'Linh Tinh','地空':'Địa Không','地劫':'Địa Kiếp'
};
const SIHUA_VI: Record<string,string> = {
  '禄':'Lộc','权':'Quyền','科':'Khoa','忌':'Kỵ'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://phuongnamtechsol.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { 
    status: 200,   // một số browser không chấp nhận 204
    headers: corsHeaders 
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { palaces, birthInfo, lunarInfo, wuxingJuName, mingGongBranch, shenGongBranch } = body;

    // Build mô tả lá số
    const palaceDesc = palaces.map((p: any) => {
      const tenCung = PALACE_VI[p.name] || p.name;
      const sao = p.stars.map((s: any) => {
        const ten = STAR_VI[s.name] || s.name;
        const sihua = s.siHua ? `[${SIHUA_VI[s.siHua]||s.siHua}]` : '';
        return `${ten}${sihua}`;
      }).join(', ');
      const dx = p.daXianAge ? ` | Đại hạn: ${p.daXianAge[0]}-${p.daXianAge[1]}` : '';
      const isMing = p.branch === mingGongBranch ? ' [CUNG MỆNH]' : '';
      const isShen = p.branch === shenGongBranch ? ' [THÂN CUNG]' : '';
      return `- Cung ${tenCung} (${BRANCHES[p.branch]})${isMing}${isShen}${dx}: ${sao||'không có sao chính'}`;
    }).join('\n');

    const prompt = `Bạn là chuyên gia Tử Vi Đẩu Số có 30 năm kinh nghiệm. Luận giải lá số sau bằng tiếng Việt, ngắn gọn nhưng sâu sắc.

THÔNG TIN LÁ SỐ:
- Dương lịch: ${birthInfo.year}/${birthInfo.month}/${birthInfo.day}
- Âm lịch: ${lunarInfo.lunarYear}/${lunarInfo.lunarMonth}/${lunarInfo.lunarDay}
- Ngũ hành cục: ${wuxingJuName}
- Mệnh cung: ${BRANCHES[mingGongBranch]}
- Thân cung: ${BRANCHES[shenGongBranch]}

CÁC CUNG:
${palaceDesc}

Trả về JSON (không có text thừa, không có markdown):
{
  "tongQuat": "Tổng quát lá số, tính cách bản mệnh (3-4 câu)",
  "tinhDuyen": "Luận cung Phu Thê, tình duyên hôn nhân (2-3 câu)",
  "suNghiep": "Luận cung Quan Lộc, công danh sự nghiệp (2-3 câu)",
  "taiLoc": "Luận cung Tài Bạch, tiền tài vật chất (2-3 câu)",
  "daiHan": "Luận đại hạn hiện tại và vận hạn gần nhất (2-3 câu)",
  "cacCung": {
    "Mệnh": "1-2 câu",
    "Phu Thê": "1-2 câu",
    "Quan Lộc": "1-2 câu",
    "Tài Bạch": "1-2 câu",
    "Phúc Đức": "1-2 câu",
    "Thiên Di": "1-2 câu",
    "Tử Nữ": "1-2 câu",
    "Tật Ách": "1-2 câu"
  }
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(
      { success: true, data: parsed },
      { headers: corsHeaders }
    );

  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

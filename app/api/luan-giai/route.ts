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

    const userPrompt = `Luận giải lá số Tử Vi sau bằng tiếng Việt, ngắn gọn nhưng sâu sắc.

THÔNG TIN LÁ SỐ:
- Dương lịch: ${birthInfo.year}/${birthInfo.month}/${birthInfo.day}
- Âm lịch: ${lunarInfo.lunarYear}/${lunarInfo.lunarMonth}/${lunarInfo.lunarDay}
- Ngũ hành cục: ${wuxingJuName}
- Mệnh cung: ${BRANCHES[mingGongBranch]}
- Thân cung: ${BRANCHES[shenGongBranch]}

CÁC CUNG:
${palaceDesc}

Trả về JSON với cấu trúc sau (KHÔNG có text ngoài JSON):
{
  "tongQuat": "Tổng quát lá số, tính cách bản mệnh (3-4 câu)",
  "tinhDuyen": "Luận cung Phu Thê, tình duyên hôn nhân (2-3 câu)",
  "suNghiep": "Luận cung Quan Lộc, công danh sự nghiệp (2-3 câu)",
  "taiLoc": "Luận cung Tài Bạch, tiền tài vật chất (2-3 câu)",
  "daiHan": "Luận đại hạn hiện tại và vận hạn gần nhất (2-3 câu)",
  "cacCung": {
    "Mệnh": "Luận đoán cung Mệnh",
    "Phu Thê": "Luận đoán cung Phu Thê",
    "Quan Lộc": "Luận đoán cung Quan Lộc",
    "Tài Bạch": "Luận đoán cung Tài Bạch",
    "Phúc Đức": "Luận đoán cung Phúc Đức",
    "Thiên Di": "Luận đoán cung Thiên Di",
    "Tử Nữ": "Luận đoán cung Tử Nữ",
    "Tật Ách": "Luận đoán cung Tật Ách"
  }
}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY chưa được cấu hình');
    }

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: 'Bạn là chuyên gia Tử Vi Đẩu Số có 30 năm kinh nghiệm. Chỉ trả về JSON thuần túy, không có markdown, không có ```json, không có text ngoài JSON.',
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    const claudeData = await claudeRes.json();
    console.log('Claude Status:', claudeRes.status);

    if (!claudeRes.ok) {
      throw new Error(`Claude API lỗi ${claudeRes.status}: ${claudeData.error?.message || JSON.stringify(claudeData)}`);
    }

    const rawText = claudeData.content?.[0]?.text;
    if (!rawText) {
      throw new Error('Mô hình không trả về dữ liệu.');
    }

    // Xử lý trường hợp Claude vẫn wrap bằng ```json ... ```
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    // Đảm bảo cacCung có đủ key, fallback về chuỗi rỗng nếu thiếu
    const finalResult = {
      tongQuat: parsed.tongQuat || '',
      tinhDuyen: parsed.tinhDuyen || '',
      suNghiep: parsed.suNghiep || '',
      taiLoc: parsed.taiLoc || '',
      daiHan: parsed.daiHan || '',
      cacCung: {
        'Mệnh':     parsed.cacCung?.['Mệnh']     || '',
        'Phu Thê':  parsed.cacCung?.['Phu Thê']  || '',
        'Quan Lộc': parsed.cacCung?.['Quan Lộc'] || '',
        'Tài Bạch': parsed.cacCung?.['Tài Bạch'] || '',
        'Phúc Đức': parsed.cacCung?.['Phúc Đức'] || '',
        'Thiên Di': parsed.cacCung?.['Thiên Di'] || '',
        'Tử Nữ':   parsed.cacCung?.['Tử Nữ']   || '',
        'Tật Ách':  parsed.cacCung?.['Tật Ách']  || '',
      },
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

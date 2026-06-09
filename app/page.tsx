'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import StarField from '@/components/StarField';
import { useTheme, type Theme } from '@/components/ThemeProvider';
import AnnouncementModal from '@/components/AnnouncementModal';

// ─── Scroll fade-in wrapper ────────────────────────────────────
function FadeIn({
  children, delay = 0, y = 28, className = '',
}: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WeakBoundary({ line }: { line: string }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
      style={{ background: `linear-gradient(to bottom, ${line}, transparent)`, opacity: 0.45 }} />
  );
}

// ─── Theme toggle button ────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      aria-label={isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{
        borderColor: isDark ? 'rgba(212,168,67,0.3)' : 'rgba(140,100,20,0.35)',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,252,242,0.85)',
        transition: 'background 0.35s ease, border-color 0.35s ease',
      }}
    >
      <div className="relative w-10 h-5 rounded-full flex-shrink-0"
        style={{
          background: isDark ? 'rgba(12,24,64,0.95)' : 'rgba(230,195,80,0.55)',
          transition: 'background 0.35s ease',
        }}>
        <motion.div
          animate={{ x: isDark ? 2 : 22 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="absolute top-1 w-3.5 h-3.5 rounded-full"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #b8a050, #e8d090)'
              : 'linear-gradient(135deg, #e89010, #f8d050)',
          }}
        />
      </div>
      <span className="text-[11px] font-medium tracking-wide select-none"
        style={{
          color: isDark ? 'rgba(212,180,100,0.85)' : 'rgba(110,72,8,0.8)',
          transition: 'color 0.35s ease',
        }}>
        {isDark ? 'Tối' : 'Sáng'}
      </span>
    </motion.button>
  );
}

// ─── 14 chính tinh ────────────────────────────────────────────
const STARS = [
  { name: 'Tử Vi' }, { name: 'Thiên Cơ' }, { name: 'Thái Dương' }, { name: 'Vũ Khúc' },
  { name: 'Thiên Đồng' }, { name: 'Liêm Trinh' }, { name: 'Thiên Phủ' }, { name: 'Thái Âm' },
  { name: 'Tham Lang' }, { name: 'Cự Môn' }, { name: 'Thiên Tướng' }, { name: 'Thiên Lương' },
  { name: 'Thất Sát' }, { name: 'Phá Quân' },
];

// ─── Tính năng ────────────────────────────────────────────
const FEATURES = [
  {
    tag: 'Hệ thống lập lá số',
    title: 'Chính thống\nNi Hải Hạ',
    subtitle: 'Không đơn giản hóa, tuân thủ nghiêm túc truyền thừa của thầy Ni Hải Hạ',
    points: [
      'Lập cục theo Nạp Âm Ngũ Hành, không dùng thuật toán đơn giản hóa trên mạng',
      'Mệnh cung nghịch số giờ sinh, thân cung thuận số giờ sinh, căn chỉnh đúng quy tắc giảng dạy',
      'Mười bốn chính tinh và Tứ Hóa phi tinh được suy diễn theo phương pháp gốc, có thể kiểm chứng',
    ],
  },
  {
    tag: 'Hiển thị lá số',
    title: 'Đầy đủ 14 chính tinh\nTứ Hóa phi tinh',
    subtitle: 'Cấu trúc rõ ràng, nhìn là hiểu trục chính và trọng điểm',
    points: [
      'Mười bốn chính tinh nhập cung đầy đủ, quan hệ giữa các sao rõ ràng dễ đọc',
      'Phụ tinh và sát tinh hiển thị cùng màn hình, tránh thiếu thông tin quan trọng',
      'Phân cấp độ sáng Miếu/Vượng/Lợi/Hãm, nhận biết nhanh mạnh yếu',
      'Nhấp vào bất kỳ chính tinh nào để xem giải thích chi tiết của thầy Ni',
    ],
  },
  {
    tag: 'Giải đọc AI',
    title: 'Phân tích sâu\nKhông chỉ tính toán',
    subtitle: 'Kho kiến thức hệ Ni Hải Hạ × Claude AI',
    points: [
      'Phân tích mệnh cách: từ chính tinh mệnh cung, kết hợp tam phương tứ chính, đưa ra đánh giá tính cách và cục diện cuộc đời toàn diện',
      'Giải đọc 6 chiều: hướng nghiệp, tình duyên hôn nhân, tài vận, sức khỏe, gia đình, con cái',
      'Theo dõi đại hạn lưu niên: trọng điểm đại hạn 10 năm hiện tại, gợi ý cụ thể và hành động cho năm nay',
      'Hỏi tự do: đặt câu hỏi trực tiếp về lá số của bạn — "Năm nay có thể đổi việc không?", "Lúc nào vận tình duyên tốt nhất?"',
    ],
  },
  {
    tag: 'Nhận diện cách cục',
    title: 'Tự động phát hiện\nCách cục lá số',
    subtitle: 'Khám phá vận mệnh từ tổ hợp tinh diệu',
    points: [
      'Tự động nhận diện 11 cách cục kinh điển: Tử Phủ đồng cung, Sát Phá Lang, Cơ Nguyệt Đồng Lương, Liêm Tướng, Vũ Khúc Thất Sát...',
      'Phát hiện chính xác các cách cục đặc biệt như Phụ Bật giáp mệnh, Nhật Nguyệt giáp mệnh và đưa ra giải thích chuẩn theo hệ Ni Hải Hạ',
      'Tự động đánh dấu các trường hợp đặc biệt Tứ Hóa nhập mệnh cung thiên di cung, gợi ý các vấn đề cuộc đời cần chú ý',
      'Cách cục phân tầng theo mức độ tốt/xấu, giúp bạn thấy ngay ưu thế và thách thức trong lá số',
    ],
  },
];

// ─── 4 module học tập ──────────────────────────────────────────
const SECTIONS = [
  {
    key: 'ziwei',
    name: 'Tử Vi',
    en: 'Zi Wei',
    desc: '14 chính tinh · 13 cung vị · Giải đọc AI',
    status: 'ready' as const,
    when: 'Tháng 5',
    icon: '◉',
    note: '',
  },
  {
    key: 'tianji',
    name: 'Thiên Kỷ',
    en: 'Tian Ji',
    desc: 'Tử Vi · Kinh Dịch · Kỳ Môn Độn Giáp',
    status: 'soon' as const,
    when: 'Tháng 6',
    icon: '⊙',
    note: '',
  },
  {
    key: 'diji',
    name: 'Địa Kỷ',
    en: 'Di Ji',
    desc: 'Di cảo thầy Ni · Hậu bối chú giải',
    status: 'soon' as const,
    when: 'Tháng 6',
    icon: '⊞',
    note: 'Nghiên cứu di cảo',
  },
  {
    key: 'renji',
    name: 'Nhân Kỷ',
    en: 'Ren Ji',
    desc: 'Nội Kinh · Thương Hàn · Kim Quỹ · Châm Cứu',
    status: 'soon' as const,
    when: 'Tháng 7',
    icon: '⊕',
    note: '',
  },
];

// ─── Giáo lý cốt lõi thầy Ni ──────────────────────────────────
const NI_TEACHINGS = [
  {
    title: 'Mệnh cung là gốc, tam phương là dụng',
    body: 'Thầy Ni luôn nhấn mạnh: xem mệnh phải xem mệnh cung trước. Chính tinh mệnh cung quyết định cục diện cơ bản và tính cách bẩm sinh, tam phương (tài bạch, quan lộc, thiên di) quyết định "đất dụng võ" của người đó. Bốn cung liên động mới là bức tranh cuộc đời hoàn chỉnh.',
  },
  {
    title: 'Đối cung mượn sao, không thể bỏ qua',
    body: 'Điểm độc đáo của thầy Ni là coi trọng "đối cung". Bất kỳ cung nào trống không sao đều phải mượn sao đối cung để luận đoán. Mệnh cung đối diện thiên di cung, hai cung ảnh hưởng lẫn nhau — đây là điểm mấu chốt mà nhiều người mới học dễ bỏ qua.',
  },
  {
    title: 'Tứ Hóa mới là bàn tay của vận mệnh',
    body: 'Tinh diệu chỉ là nền tảng, Tứ Hóa (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ) mới là yếu tố quyết định vận thế tốt xấu. Cùng một ngôi sao, có Hóa Lộc hay Hóa Kỵ, quỹ đạo cuộc đời có thể hoàn toàn khác nhau. Thầy Ni nhiều lần nhấn mạnh: không xem Tứ Hóa, giải lá số mới xong một nửa.',
  },
  {
    title: 'Đại hạn mười năm, vận thế có tiết',
    body: 'Thầy Ni chia cuộc đời thành 12 đại hạn, mỗi đại hạn 10 năm. Ông cho rằng con người ở các đại hạn khác nhau, cơ duyên hoàn toàn khác. Hiểu mình đang đi đại hạn nào, cung vị đó có sao gì, mới thực sự nắm được vận thế hiện tại.',
  },
];

// ─── Theme color helper ───────────────────────────────────────
function useColors(theme: Theme) {
  const d = theme === 'dark';
  return {
    bgBase:       d ? '#020810'                                : '#f5efe0',
    navBg:        d ? '#020810'                                : '#f5efe0',
    navBorder:    d ? 'rgba(255,255,255,0.05)'                : 'rgba(160,120,30,0.15)',
    goldGrad:     d ? 'linear-gradient(160deg,#c8993a 0%,#f0d070 40%,#c8993a 70%,#f0c755 100%)'
                    : 'linear-gradient(160deg,#6a4206 0%,#9a6a10 40%,#6a4206 70%,#885010 100%)',
    goldSolid:    d ? '#d4a843'                               : '#8b6410',
    goldLine:     d ? 'rgba(212,168,67,0.4)'                  : 'rgba(140,100,20,0.4)',
    tagText:      d ? 'rgba(212,168,67,0.6)'                  : 'rgba(120,80,10,0.65)',
    textPrimary:  d ? '#e8eef6'                               : '#1a1d24',
    textSecond:   d ? '#b8c6df'                               : '#3a3f4a',
    textMuted:    d ? '#9db0d0'                               : '#5a6275',
    textFaint:    d ? 'rgba(240,246,255,0.56)'                : '#9da4b3',
    accent:       d ? '#3a78d4'                               : '#3a5a82',
    accentSoft:   d ? 'rgba(58,120,212,0.18)'                 : 'rgba(58,90,130,0.10)',
    cardBg:       d ? 'rgba(255,255,255,0.05)'                : 'rgba(255,255,255,0.88)',
    cardBorder:   d ? 'rgba(255,255,255,0.10)'                : 'rgba(200,160,60,0.25)',
    cardShadow:   d ? '0 4px 32px rgba(0,0,0,0.5)'           : '0 4px 24px rgba(140,100,20,0.12)',
    featureBg:    d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.75)',
    featureBord:  d ? 'rgba(255,255,255,0.08)'                : 'rgba(200,160,60,0.2)',
    glowTint:     d ? 'rgba(212,168,67,0.07)'                 : 'rgba(180,140,40,0.06)',
    glowBlue:     d ? 'rgba(40,80,160,0.12)'                  : 'rgba(58,90,130,0.06)',
    glowPurple:   d ? 'rgba(120,50,180,0.08)'                 : 'rgba(96,80,140,0.04)',
    niBg:         d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.8)',
    niBorder:     d ? 'rgba(212,168,67,0.2)'                  : 'rgba(180,130,40,0.25)',
    niDivider:    d ? 'rgba(255,255,255,0.08)'                : 'rgba(180,130,40,0.12)',
    niCardBg:     d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.9)',
    niCardBord:   d ? 'rgba(255,255,255,0.08)'                : 'rgba(200,160,60,0.2)',
    niCardShadow: d ? '0 2px 20px rgba(0,0,0,0.4)'           : '0 2px 16px rgba(140,100,20,0.1)',
    starBg:       d ? 'rgba(255,255,255,0.04)'                : 'rgba(255,255,255,0.7)',
    starBorder:   d ? 'rgba(212,168,67,0.22)'                 : 'rgba(160,120,30,0.3)',
    starText:     d ? 'rgba(212,168,67,0.7)'                  : 'rgba(120,80,10,0.7)',
    ctaBg:        d ? 'linear-gradient(135deg,#b8892a,#f0d070,#b8892a)'
                    : 'linear-gradient(135deg,#6a4206,#9a6810,#6a4206)',
    ctaText:      d ? '#08080a'                               : '#f8f3e8',
    footerText:   d ? 'rgba(255,255,255,0.08)'                : '#d0b878',
    scrollLine:   d ? 'rgba(212,168,67,0.3)'                  : 'rgba(140,100,20,0.3)',
    scrollText:   d ? 'rgba(255,255,255,0.12)'                : '#c0a870',
    altSection:   d ? 'rgba(255,255,255,0.02)'                : 'rgba(255,255,255,0.4)',
    quoteBg:      d ? 'rgba(212,168,67,0.04)'                 : 'rgba(255,255,255,0.9)',
  };
}

// ─── Tứ Hóa brief ─────────────────────────────────────────────
const SIHUA_BRIEF: Record<string, { attr: string; brief: string }> = {
  'Hóa Lộc': { attr: 'Cát hóa · Tăng ích', brief: 'Phúc tinh nhập cung, chủ tài vận và phúc khí tăng ích. Sự việc ở cung vị đó thuận lợi, năng lực tăng cường — hóa tinh được chào đón nhất trong lá số.' },
  'Hóa Quyền': { attr: 'Cát hóa · Uy quyền', brief: 'Quyền lực tinh nhập cung, chủ kiểm soát và lãnh đạo. Cung vị đó chủ mạnh mẽ và quyết đoán, thích nhập quan lộc cung và mệnh cung, chủ thực quyền trong sự nghiệp.' },
  'Hóa Khoa': { attr: 'Cát hóa · Danh dự', brief: 'Khoa danh tinh nhập cung, chủ danh tiếng và quý nhân duyên. Cung vị đó chủ văn danh và thi cử, có quý nhân phù trợ, lợi học thuật, thi cử và nơi công cộng.' },
  'Hóa Kỵ': { attr: 'Hung hóa · Chướng ngại', brief: 'Kiếp số tinh nhập cung, chủ chấp niệm và trở ngại. Cung vị đó cần đặc biệt chú ý, bài toán cuộc đời ở cung đó sẽ là thử thách lớn.' },
};

// ─── Chính tinh brief ─────────────────────────────────────────
const STAR_BRIEF: Record<string, { attr: string; brief: string }> = {
  'Tử Vi': { attr: 'Thổ · Đế Vương tinh', brief: 'Thiên hoàng quý tinh, thống lĩnh quần tinh. Tọa mệnh có khí cô ngạo, chủ uy quyền hiển đạt, thiên sinh khí chất lãnh đạo, thích hợp vai trò độc lập đứng đầu.' },
  'Thiên Cơ': { attr: 'Mộc · Trí tuệ tinh', brief: 'Ích thọ tinh, chủ mưu trí và biến động. Thông minh lanh lợi, giỏi tính toán, tâm tư tinh tế, thích hợp công việc lập kế hoạch, cố vấn, kỹ thuật.' },
  'Thái Dương': { attr: 'Hỏa · Quan lộc chủ', brief: 'Quan lộc chủ tinh, chủ danh tiếng và danh vọng. Hào phóng, coi trọng hình tượng công chúng, lợi quan trường và công chức, nam mệnh lực mạnh, nhập miếu quang minh lỗi lạc.' },
  'Vũ Khúc': { attr: 'Kim · Tài bạch chủ', brief: 'Tài bạch chủ tinh, chủ tài chính và quyết đoán. Ý chí kiên định, hành động quả cảm, thích hợp tài chính, ngân hàng, quân cảnh, cô khắc chi tinh, lợi kết hôn muộn.' },
  'Thiên Đồng': { attr: 'Thủy · Phúc tinh', brief: 'Phúc đức chủ tinh, chủ hưởng thụ và nhân duyên. Tính tình ôn hòa, nhân duyên rất tốt, coi trọng chất lượng cuộc sống, tình cảm tinh tế, vận cuối đời tốt.' },
  'Liêm Trinh': { attr: 'Hỏa · Tài nghệ tinh', brief: 'Thứ đào hoa tinh, chủ tài nghệ và tình dục. Tài năng xuất chúng, tình cảm phong phú, thích hợp nghệ thuật, chính giới, đa tài nhưng cần phòng đào hoa thị phi.' },
  'Thiên Phủ': { attr: 'Thổ · Tài khố tinh', brief: 'Nam đẩu chủ tinh, chủ kho tài và tích lũy. Ổn trọng bảo thủ, năng lực lý tài mạnh, là sức mạnh ổn định của lá số, thích hợp quản lý tài chính và hành chính.' },
  'Thái Âm': { attr: 'Thủy · Điền trạch chủ', brief: 'Điền trạch chủ tinh, chủ tài phú và âm nhu. Tinh tế ôn nhu, cảm nhận mạnh, nữ mệnh đặc biệt tốt, lợi bất động sản và tích lũy, thích hợp văn nghệ hoặc dịch vụ.' },
  'Tham Lang': { attr: 'Mộc Thủy · Đào hoa', brief: 'Đào hoa tinh, chủ dục vọng và tài nghệ. Đa tài đa nghệ, dục vọng mạnh mẽ, giao tiếp sôi nổi, thích hợp nghệ thuật, PR, thương mại, nhân duyên rất tốt.' },
  'Cự Môn': { attr: 'Thủy · Thị phi tinh', brief: 'Ám tinh, chủ khẩu tài và thị phi. Khẩu tài xuất sắc, năng lực tư biện mạnh, thích hợp luật sư, giáo dục, truyền thông, chú ý thị phi miệng lưỡi, lập thân bằng tài biện.' },
  'Thiên Tướng': { attr: 'Thủy · Ấn tinh', brief: 'Ấn tinh, chủ phụ tá và ấn thụ. Giỏi phối hợp, coi trọng lễ tiết, chính trực tuân pháp, thích hợp mưu sĩ, hành chính, pháp luật, quý nhân vận tốt.' },
  'Thiên Lương': { attr: 'Thổ · Âm tinh', brief: 'Âm tinh, chủ lão thành và che chở. Chính trực ổn trọng, tâm từ bi mạnh, ông trời sẽ phù hộ, thích hợp y tế, công tác xã hội, tôn giáo.' },
  'Thất Sát': { attr: 'Kim Hỏa · Tướng tinh', brief: 'Tướng tinh, chủ cương liệt và khai sáng. Tính cách cứng rắn, hành động lực mạnh, dũng cảm thách thức, thích hợp khởi nghiệp, quân cảnh, ngành cạnh tranh, gặp hung hóa cát.' },
  'Phá Quân': { attr: 'Thủy · Hao tinh', brief: 'Hao tinh, chủ biến động và khai thác. Dũng cảm đột phá, không sợ thay đổi, cả đời biến động lớn nhưng có khí phách, thích hợp công việc khai thác, đi con đường người khác chưa đi.' },
};

// ─── Feature visual decorations ──────────────────────────────
function FeatureVisual({ index, colors: c }: { index: number; colors: ReturnType<typeof useColors> }) {
  if (index === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <div className="grid grid-cols-4 gap-1.5 w-72 mx-auto">
          {Array.from({ length: 16 }).map((_, i) => {
            const isCenter = [5, 6, 9, 10].includes(i);
            const isActive = [0, 3, 12, 15].includes(i);
            return (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="h-14 rounded-sm flex items-center justify-center text-xs transition-all duration-300"
                style={{
                  border: `1px solid ${isActive ? c.goldLine : c.cardBorder}`,
                  background: isCenter ? 'transparent' : isActive ? c.starBg : c.featureBg,
                  color: isActive ? c.goldSolid : c.textFaint,
                  opacity: isCenter ? 0 : 1,
                }}>
                {isActive ? '★' : ''}
              </motion.div>
            );
          })}
        </div>
        <p className="text-[10px] tracking-widest transition-colors duration-300"
          style={{ color: c.textFaint }}>Phương pháp lập bàn Ni Hải Hạ</p>
      </div>
    );
  }

  if (index === 1) {
    const [sel, setSel] = useState<string | null>(null);
    const selInfo = sel ? (STAR_BRIEF[sel] ?? SIHUA_BRIEF[sel] ?? null) : null;
    return (
      <div className="flex flex-col gap-4 h-full justify-center">
        {[
          { group: 'Hệ Tử Vi', stars: ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh'] },
          { group: 'Hệ Thiên Phủ', stars: ['Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'] },
        ].map(group => (
          <div key={group.group}>
            <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
              style={{ color: c.textFaint }}>{group.group}</div>
            <div className="flex flex-wrap gap-1.5">
              {group.stars.map(s => (
                <motion.button key={s}
                  onClick={() => setSel(sel === s ? null : s)}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="text-xs px-2 py-1 rounded-md cursor-pointer"
                  style={{
                    border: `1px solid ${sel === s ? c.goldSolid : c.goldLine}`,
                    color: c.goldSolid,
                    background: sel === s ? `${c.goldLine}30` : 'transparent',
                    fontWeight: sel === s ? 600 : 400,
                  }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
            style={{ color: c.textFaint }}>Tứ Hóa phi tinh</div>
          <div className="flex gap-2 flex-wrap">
            {[['Hóa Lộc', 'rgba(52,211,153,0.7)'], ['Hóa Quyền', 'rgba(96,165,250,0.7)'], ['Hóa Khoa', 'rgba(250,204,21,0.7)'], ['Hóa Kỵ', 'rgba(248,113,113,0.7)']].map(([label, color]) => (
              <motion.button key={label}
                onClick={() => setSel(sel === label ? null : label)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="text-xs px-2.5 py-1 rounded-md cursor-pointer"
                style={{
                  border: `1px solid ${color}`,
                  color,
                  background: sel === label ? `${color.replace('0.7', '0.15')}` : 'transparent',
                  fontWeight: sel === label ? 600 : 400,
                }}>
                {label}
              </motion.button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {selInfo && (
            <motion.div key={sel}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-4 mt-1.5"
              style={{ border: `1px solid ${c.goldLine}`, background: c.featureBg }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: c.goldSolid }}>{sel}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: c.tagText, border: `1px solid ${c.goldLine}` }}>{selInfo.attr}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: c.textSecond }}>{selInfo.brief}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (index === 2) {
    const msgs = [
      { role: 'user', text: 'Vận sự nghiệp năm nay của tôi như thế nào?' },
      { role: 'ai', text: 'Mệnh cung Thiên Cơ Hóa Lộc, năm nay đại hạn đi quan lộc cung, tam phương có Tả Phụ tương trợ, sự nghiệp có quý nhân đề bạt, thích hợp chủ động mở rộng...' },
      { role: 'user', text: 'Lúc nào vận tình duyên tốt nhất?' },
    ];
    return (
      <div className="flex flex-col gap-2 h-full justify-center">
        {msgs.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] text-[11px] px-3 py-2 rounded-lg leading-relaxed"
              style={{
                border: `1px solid ${m.role === 'user' ? c.goldLine : c.cardBorder}`,
                background: m.role === 'user' ? c.starBg : c.featureBg,
                color: m.role === 'user' ? c.goldSolid : c.textSecond,
              }}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (index === 3) {
    const patterns = [
      { name: 'Sát Phá Lang cách', desc: 'Mệnh khai sáng tiến thủ', ok: true },
      { name: 'Liêm Tướng cách', desc: 'Cách cục ấn thụ hành chính', ok: true },
      { name: 'Hóa Kỵ nhập mệnh', desc: 'Cần chú ý bài toán tâm lý', ok: false },
    ];
    return (
      <div className="flex flex-col gap-3 h-full justify-center">
        {patterns.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              border: `1px solid ${p.ok ? 'rgba(96,165,250,0.25)' : 'rgba(251,146,60,0.25)'}`,
              background: p.ok ? 'rgba(96,165,250,0.05)' : 'rgba(251,146,60,0.05)',
            }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: p.ok ? 'rgba(96,165,250,0.6)' : 'rgba(251,146,60,0.6)' }} />
            <div>
              <div className="text-[11px] font-medium"
                style={{ color: p.ok ? 'rgba(147,197,253,0.8)' : 'rgba(253,186,116,0.8)' }}>{p.name}</div>
              <div className="text-[10px]" style={{ color: c.textMuted }}>{p.desc}</div>
            </div>
          </motion.div>
        ))}
        <div className="text-[9px] mt-2 tracking-wider text-center" style={{ color: c.textFaint }}>
          Tự động nhận diện 11 cách cục kinh điển
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main page ────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = useColors(theme);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  useLayoutEffect(() => {
    document.documentElement.style.background = c.bgBase;
    document.body.style.background = c.bgBase;
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, [c.bgBase]);

  return (
    <div style={{ background: c.bgBase, transition: 'background 0.35s ease' }} className="overflow-x-hidden">
      <AnnouncementModal />
      <StarField />

      {/* Global glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowTint} 0%, transparent 70%)` }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowBlue} 0%, transparent 70%)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowPurple} 0%, transparent 70%)` }} />
      </div>

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 gap-2"
        style={{ background: c.navBg }}>
        <div className="text-[11px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] font-medium transition-colors duration-300 flex-shrink-0"
          style={{ color: c.goldSolid }}>
          Tử Vi Mệnh Bàn
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/heming')}
            className="text-[11px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300"
            style={{ border: `1px solid ${c.navBorder}`, color: c.textMuted }}>
            Hợp Bàn
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="text-[11px] sm:text-xs px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300"
            style={{ border: `1px solid ${c.goldLine}`, color: c.goldSolid }}>
            Lập Lá Số
          </motion.button>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[82svh] lg:min-h-[92vh] flex flex-col items-center justify-center px-6 z-10 pb-24 pt-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity, maxWidth: '960px' }} className="text-center w-full mx-auto mt-10">
          {/* Tag line */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[11px] tracking-[0.45em] transition-colors duration-300" style={{ color: c.tagText }}>
              Tử Vi Đẩu Số · Hệ Thống Ni Hải Hạ
            </span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </motion.div>

          {/* Main title */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ position: 'relative', display: 'inline-block' }}>
            <h1
              className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold leading-none mb-5`}
              style={{
                fontSize: 'clamp(40px, 8vw, 100px)',
                letterSpacing: '0.05em',
              }}>
              Tử Vi Mệnh Bàn
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-base md:text-lg tracking-[0.12em] mb-2"
            style={{ color: c.textSecond, fontWeight: 500 }}>
            Tử Vi làm cửa · Thiên Địa Nhân làm đường · Ni Hải Hạ làm thầy
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="text-xs md:text-sm tracking-[0.25em] mb-6"
            style={{ color: c.textMuted, opacity: 0.85 }}>
            AI Giải Đáp · Tri Hành Hợp Nhất
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="text-sm max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: c.textMuted }}>
            Nhập ngày tháng năm giờ sinh, tạo lá số Tử Vi Đẩu Số riêng của bạn — các module Thiên Kỷ, Địa Kỷ, Nhân Kỷ sẽ lần lượt mở.
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ y: -2, filter: 'brightness(1.06)' }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/chart')}
              className="px-12 py-4 font-semibold text-base tracking-widest rounded-full"
              style={{ background: c.ctaBg, color: c.ctaText }}>
              Lập Lá Số Ngay
            </motion.button>
          </motion.div>

          {/* 14 chính tinh */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.8 }}
            className="mt-12 grid grid-cols-7 gap-1.5 max-w-[540px] mx-auto">
            {STARS.map((star, i) => (
              <motion.div key={star.name}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.05 + i * 0.03, duration: 0.35 }}
                className="flex items-center justify-center px-2 py-1 rounded-full"
                style={{ background: c.starBg, border: `1px solid ${c.starBorder}` }}>
                <span className="text-[11px] tracking-wide" style={{ color: c.starText }}>{star.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Sticky note — desktop */}
        <motion.div
          initial={{ opacity: 0, x: 30, rotate: 0 }}
          animate={{ opacity: 1, x: 0, rotate: -4 }}
          transition={{ delay: 1.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute hidden lg:block pointer-events-none"
          style={{ right: 'clamp(2%, 6vw, 8%)', top: '54%', maxWidth: '240px' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fff5e3 0%, #ffe1c0 100%)',
            border: '2px dashed rgba(232,132,62,0.45)',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 24px rgba(196,90,45,0.18), 0 2px 6px rgba(196,90,45,0.1)',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px', lineHeight: 1 }}>🎁</div>
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              <span style={{ color: '#c45a2d', fontWeight: 700, fontSize: '14px' }}>5/1 — 5/8</span>
              <span> Ưu đãi có hạn</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              Toàn bộ tính năng + AI
              <strong style={{ color: '#c45a2d' }}> Hoàn toàn miễn phí</strong>
            </div>
          </div>
        </motion.div>

        {/* Sticky note — mobile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ delay: 1.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="lg:hidden mx-auto mt-8 mb-2 pointer-events-none"
          style={{ maxWidth: 'min(280px, 84vw)' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #fff5e3 0%, #ffe1c0 100%)',
            border: '2px dashed rgba(232,132,62,0.45)',
            borderRadius: '14px',
            padding: '12px 16px',
            boxShadow: '0 6px 18px rgba(196,90,45,0.16), 0 2px 4px rgba(196,90,45,0.08)',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px', lineHeight: 1 }}>🎁</div>
            <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              <span style={{ color: '#c45a2d', fontWeight: 700, fontSize: '13px' }}>5/1 — 5/8</span>
              <span> Ưu đãi có hạn</span>
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#8b3a1a', fontWeight: 500 }}>
              Toàn bộ tính năng + AI <strong style={{ color: '#c45a2d' }}>miễn phí</strong>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: c.scrollText }}>Khám phá thêm</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${c.scrollLine}, transparent)` }} />
        </motion.div>
      </section>

      {/* ══ Philosophy quote ══════════════════════════════ */}
      <section className="relative z-10 overflow-hidden min-h-[82svh] lg:min-h-[92vh] flex items-center" style={{ padding: '72px 24px' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="absolute inset-0"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, #020810 0%, #020810 6%, #030a18 22%, #0d0820 40%, #0a0618 68%, #030a18 86%, #020810 100%)'
              : 'linear-gradient(to bottom, #f5efe0 0%, #f5efe0 6%, #c08055 18%, #6a2810 32%, #1e0a02 50%, #1e0a02 70%, #6a2810 84%, #f5efe0 100%)',
            transition: 'background 0.4s ease',
          }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-bold" style={{ fontSize: 'clamp(220px, 38vw, 460px)', color: 'rgba(212,168,67,0.012)', lineHeight: 1, fontFamily: 'serif' }}>命</span>
        </div>
        <FadeIn className="relative mx-auto text-center w-full" y={20}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(212,168,67,0.45))' }} />
            <span className="text-[10px] tracking-[0.55em] uppercase" style={{ color: 'rgba(212,168,67,0.5)' }}>Mệnh · Vận · Quan</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(212,168,67,0.45))' }} />
          </div>
          <div className="space-y-3" style={{ maxWidth: '840px', margin: '0 auto' }}>
            {[
              { text: 'Ý nghĩa của việc nhìn trước vận mệnh', size: 'clamp(17px, 2.2vw, 28px)', color: 'rgba(215,228,252,0.72)', delay: 0.1 },
              { text: 'Không phải để biết trước tương lai', size: 'clamp(21px, 2.6vw, 32px)', color: 'rgba(220,232,250,0.74)', delay: 0.25 },
              { text: 'Mà là để không ngừng hiểu chính mình', size: 'clamp(24px, 3vw, 40px)', color: 'rgba(218,230,248,0.8)', delay: 0.34 },
            ].map((line, i) => (
              <motion.p key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: line.delay }}
                className="tracking-wider" style={{ fontSize: line.size, color: line.color, fontWeight: 400 }}>
                {line.text}
              </motion.p>
            ))}
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold`}
              style={{ fontSize: 'clamp(24px, 3.4vw, 48px)', letterSpacing: '0.05em', lineHeight: 1.35 }}>
              Để cuối cùng tự viết kịch bản cuộc đời của chính mình
            </motion.p>
          </div>
        </FadeIn>
      </section>

      {/* ══ 4 module timeline ════════════════════════════ */}
      <section className="relative z-10 py-20 lg:py-24 px-6"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.03) 50%, transparent 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.04) 50%, transparent 100%)',
        }}>
        <FadeIn className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: c.goldSolid, opacity: 0.7 }}>Chương trình học</span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </div>
          <div className="text-2xl lg:text-3xl font-bold mb-2 tracking-[0.15em]" style={{ color: c.textPrimary }}>
            Phương pháp luận thầy Ni · Từng bước mở ra
          </div>
          <div className="text-xs lg:text-sm tracking-[0.1em]" style={{ color: c.textMuted }}>
            Từ Tử Vi nhập môn, dần mở các module Thiên Kỷ / Địa Kỷ / Nhân Kỷ
          </div>
        </FadeIn>

        <div className="max-w-sm lg:max-w-5xl mx-auto relative">
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5"
            style={{
              background: `linear-gradient(90deg, ${c.goldSolid} 0%, ${c.goldSolid} 25%, ${c.goldLine} 25%)`,
              opacity: 0.6,
            }} />
          <div className="lg:hidden absolute left-7 top-7 bottom-7 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, ${c.goldSolid} 0%, ${c.goldSolid} 22%, ${c.goldLine} 22%)`,
              opacity: 0.6,
            }} />

          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-4">
            {SECTIONS.map((s, i) => {
              const ready = s.status === 'ready';
              return (
                <motion.div key={s.key}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-4 lg:gap-0">
                  <div className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center lg:mb-3"
                    style={{
                      background: ready
                        ? `linear-gradient(135deg, ${c.goldSolid} 0%, ${c.goldSolid}cc 100%)`
                        : (theme === 'dark' ? 'rgba(184,146,42,0.05)' : '#fdf8ee'),
                      border: ready ? 'none' : `2px dashed ${c.goldLine}`,
                      color: ready ? '#fff' : c.textMuted,
                      boxShadow: ready ? `0 4px 16px ${c.goldSolid}55` : 'none',
                    }}>
                    <span className="text-2xl">{s.icon}</span>
                    {ready && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ background: '#10b981', boxShadow: '0 2px 6px rgba(16,185,129,0.4)' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="flex-1 lg:flex-none flex flex-col items-start lg:items-center min-w-0">
                    <div className="flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:mb-1">
                      <div className="text-[10px] tracking-[0.25em] lg:mb-1.5"
                        style={{ color: ready ? '#10b981' : c.textMuted, fontWeight: 500 }}>
                        {s.when}
                      </div>
                      <div className="text-base lg:text-xl font-semibold tracking-[0.15em]"
                        style={{ color: c.textPrimary }}>
                        {s.name}
                      </div>
                      {s.note && (
                        <div className="text-[9px] tracking-[0.15em] px-2 py-0.5 rounded-full lg:hidden"
                          style={{
                            color: c.goldSolid,
                            background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                            border: `1px solid ${c.goldLine}`,
                            opacity: 0.85,
                          }}>
                          {s.note}
                        </div>
                      )}
                    </div>
                    {s.note && (
                      <div className="hidden lg:block text-[9px] tracking-[0.15em] mb-1.5 px-2 py-0.5 rounded-full"
                        style={{
                          color: c.goldSolid,
                          background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                          border: `1px solid ${c.goldLine}`,
                          opacity: 0.85,
                        }}>
                        {s.note}
                      </div>
                    )}
                    <div className="text-[11px] lg:text-xs leading-relaxed lg:max-w-[200px] mt-0.5 lg:mt-0"
                      style={{ color: c.textSecond }}>
                      {s.desc}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ Feature details ══════════════════════════════ */}
      <section className="relative z-10">
        {FEATURES.map((feature, i) => (
          <div key={i}
            className={`flex items-center px-6 md:px-10 lg:px-14 py-20 md:py-24 ${i <= 2 ? 'min-h-[82svh] lg:min-h-[92vh]' : ''}`}
            style={{ background: i % 2 === 1 ? c.altSection : 'transparent' }}>
            <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
              <div className={`grid grid-cols-1 ${i % 2 === 0 ? 'lg:grid-cols-[0.45fr_0.55fr]' : 'lg:grid-cols-[0.55fr_0.45fr]'} gap-10 lg:gap-16 items-start ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <FadeIn delay={0}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8" style={{ background: c.goldLine }} />
                      <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>{feature.tag}</span>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.1}>
                    <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold leading-tight mb-5 tracking-tight`}
                      style={{
                        fontSize: i < 2 ? 'clamp(36px, 4vw, 56px)' : 'clamp(30px, 3.5vw, 48px)',
                        whiteSpace: 'pre-line',
                      }}>
                      {feature.title}
                    </h2>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <p className="text-base mb-8 leading-relaxed" style={{ color: c.textSecond }}>{feature.subtitle}</p>
                  </FadeIn>
                  <div className="space-y-4">
                    {feature.points.map((point, j) => (
                      <FadeIn key={j} delay={0.25 + j * 0.08}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-2 w-1 h-1 rounded-full" style={{ background: c.goldSolid, opacity: 0.6 }} />
                          <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{point}</p>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
                <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <FadeIn delay={0.15}>
                    <div className="relative rounded-2xl overflow-hidden p-8 md:p-12"
                      style={{
                        border: `1px solid ${c.featureBord}`,
                        background: c.featureBg,
                        minHeight: i <= 1 ? '540px' : i === 2 ? '460px' : '320px',
                        boxShadow: c.cardShadow,
                      }}>
                      <FeatureVisual index={i} colors={c} />
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ══ Thiên · Địa · Nhân ════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20"
        style={{ background: c.altSection, minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Ni Haixia · Philosophy</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-5 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                Thiên · Địa · Nhân
              </h2>
              <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: c.textSecond }}>
                Quan điểm vận mệnh cốt lõi của thầy Ni Hải Hạ: vận mệnh chưa bao giờ là tất cả của cuộc đời.<br />
                Ông chia sức mạnh ảnh hưởng đến cuộc đời thành ba chiều kích quan trọng như nhau.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { glyph: '天', label: 'Vận mệnh bẩm sinh', pct: '⅓', color: c.goldSolid, borderColor: c.goldLine, desc: 'Điều mà Tử Vi Đẩu Số tiết lộ chính là cục diện lá số bẩm sinh — bố cục tinh diệu do thời điểm sinh quyết định, số cục ngũ hành, chính tinh mệnh cung. Đây chỉ là một phần ba của vận mệnh, là màu nền của cuộc đời, chứ không phải toàn bộ.', sub: 'Lá số · Tinh diệu · Ngũ hành' },
              { glyph: '地', label: 'Môi trường địa lý', pct: '⅓', color: 'rgba(96,165,250,0.9)', borderColor: 'rgba(96,165,250,0.3)', desc: 'Môi trường địa lý nơi bạn sống, thành phố, quốc gia, phong thủy, cùng xuất thân gia đình và cấu trúc xã hội, cùng tạo nên chiều kích thứ hai của vận mệnh. Cùng một lá số, sinh ra ở nơi khác nhau, cuộc đời có thể hoàn toàn khác biệt.', sub: 'Địa vực · Phong thủy · Môi trường' },
              { glyph: '人', label: 'Ý chí con người', pct: '⅓', color: 'rgba(100,216,139,0.9)', borderColor: 'rgba(100,216,139,0.3)', desc: 'Ý chí, tâm thái, lựa chọn và hành động cá nhân mới là sức mạnh chủ động nhất để thay đổi vận mệnh. Thầy Ni nhấn mạnh: hiểu lá số là để làm người tốt hơn, chứ không phải ngồi chờ vận mệnh sắp đặt. Rèn luyện bản thân mới là con đường phá cục mạnh nhất.', sub: 'Ý chí · Lựa chọn · Hành động' },
            ].map((item, i) => (
              <FadeIn key={item.glyph} delay={0.1 + i * 0.12}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.1 }}
                  className="rounded-2xl p-7 h-full flex flex-col"
                  style={{ background: c.cardBg, border: `1px solid ${item.borderColor}`, boxShadow: c.cardShadow }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="text-5xl font-bold leading-none" style={{ color: item.color }}>{item.glyph}</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: item.color }}>{item.pct}</div>
                      <div className="text-[9px] mt-0.5 tracking-widest" style={{ color: c.textMuted }}>of life</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-0.5" style={{ color: item.color }}>{item.label}</div>
                    <div className="text-[10px] tracking-wider" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                  <div className="h-px mb-4" style={{ background: item.borderColor }} />
                  <p className="text-xs leading-relaxed flex-1" style={{ color: c.textSecond }}>{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-sm leading-relaxed" style={{ color: c.textSecond }}>
                「Vận mệnh không phải là tất cả cuộc đời, cộng thêm địa lý và ý niệm con người mới là đủ.」
              </p>
              <p className="mt-2 text-[10px] tracking-widest" style={{ color: c.tagText }}>— Ni Hải Hạ</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ Thầy Ni Hải Hạ ════════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20" style={{ minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Master · 1953 – 2012</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-6 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                Thầy Ni Hải Hạ
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed text-sm" style={{ color: c.textSecond }}>
                Một trong những bậc thầy Đông y và thuật số có ảnh hưởng nhất trong cộng đồng người Hoa đương đại<br />
                Sáng lập Học viện Hán Đường Trung Y tại Mỹ · Truyền thế hai hệ thống giảng dạy lớn「Nhân Kỷ」và「Thiên Kỷ」
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl p-8 md:p-10 mb-8"
              style={{ border: `1px solid ${c.niBorder}`, background: c.niBg, boxShadow: c.cardShadow }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Sinh năm', value: '1954', sub: 'Đài Loan' },
                  { label: 'Qua đời', value: '2012', sub: '31 tháng 1 · Hưởng thọ 58' },
                  { label: 'Truyền thừa', value: 'Tử Vi Đẩu Số', sub: 'Kinh phương Đông y · Kinh Dịch' },
                ].map(item => (
                  <div key={item.label} className="text-center rounded-xl px-4 py-3"
                    style={{ border: `1px solid ${c.niDivider}`, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-[10px] tracking-[0.3em] mb-1" style={{ color: c.textFaint }}>{item.label}</div>
                    <div className="text-2xl font-semibold mb-0.5" style={{ color: c.goldSolid }}>{item.value}</div>
                    <div className="text-[11px]" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="h-px mb-8" style={{ background: c.niDivider }} />
              <div className="space-y-4 text-sm leading-relaxed max-w-3xl mx-auto" style={{ color: c.textSecond }}>
                <p>
                  <strong style={{ color: c.goldSolid }}>Tiểu sử</strong>：
                  Ni Hải Hạ (1954–2012) sinh tại Đài Loan, từ nhỏ theo học nhiều danh y Đông y, chuyên nghiên cứu phái Kinh phương (truyền thừa《Thương Hàn Luận》).
                  Trung niên sang Mỹ hành nghề y, sáng lập <strong>Học viện Hán Đường Trung Y</strong>, hơn hai mươi năm hệ thống giảng dạy Đông y và thuật số truyền thống.
                  Ngày 31 tháng 1 năm 2012 qua đời vì ung thư gan tại Đài Loan, hưởng thọ 58 tuổi.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Hệ thống giảng dạy</strong>：
                  Thầy Ni tổng hợp tri thức cả đời thành hai bộ giảng dạy công khai lớn.
                  <strong>「Nhân Kỷ」</strong>bao gồm《Châm Cứu Đại Thành》《Thần Nông Bản Thảo Kinh》《Hoàng Đế Nội Kinh》《Thương Hàn Luận》《Kim Quỹ Yếu Lược》—
                  đây là「kỷ cương của con người」, đặt nền tảng con đường học Đông y hoàn chỉnh;
                  <strong>「Thiên Kỷ」</strong>bao gồm Tử Vi Đẩu Số và《Kinh Dịch》— đây là「kỷ cương của trời」, kết quả hệ thống hóa nghiên cứu thuật số.
                  Hai bộ hợp lại là di sản hoàn chỉnh nhất thầy Ni để lại cho hậu thế.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Lập trường Tử Vi</strong>：
                  Thầy Ni trong Tử Vi Đẩu Số rõ ràng thuộc <strong>Nam phái Tam hợp phái</strong>, chủ trương「lấy mệnh cung làm gốc, lấy tam phương tứ chính làm dụng, lấy Tứ Hóa làm cương」.
                  Ông nói rõ trong khóa học《Thiên Kỷ》:「<em>Phi tinh (Tứ Hóa) bay qua bay lại quá phức tạp, không làm cái này, đại đạo vốn giản dị</em>」—
                  lập trường này phân biệt rõ ông với phái Phi Tinh phức tạp.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Thái độ trị học</strong>：
                  Thầy Ni phản đối học vẹt khẩu quyết, nhấn mạnh「hiểu nguyên lý hơn thuộc lòng」「logic có thể kiểm chứng hơn huyền bí thần bí」.
                  Thái độ này đưa Tử Vi Đẩu Số từ hệ thống truyền thụ kín sư đồ, bước vào hệ thống kiến thức hiện đại có hệ thống, có thể kiểm chứng, có thể học được.
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>Ảnh hưởng đương đại</strong>：
                  Video giảng dạy của thầy Ni lưu hành rộng rãi trên YouTube và các nền tảng lớn, là tài liệu nhập môn bắt buộc được thế hệ mới yêu thích mệnh lý và Đông y công nhận.
                  Ông không chỉ là người truyền thừa Tử Vi Đẩu Số, mà còn là nhân vật then chốt đưa mệnh lý truyền thống và Đông y vào hệ thống kiến thức hiện đại.
                </p>
                <p style={{ fontSize: '11px', color: c.textMuted, fontStyle: 'italic', marginTop: '12px' }}>
                  Mọi giải đọc trên nền tảng này được tổng hợp từ giảng nghĩa công khai《Thiên Kỷ》của thầy Ni,《Tử Vi Đẩu Số Toàn Thư》bản Minh,
                  và cổ tịch Tam hợp phái truyền thống, chỉ mang tính tham khảo văn hóa và phát triển cá nhân. Thầy Ni và nền tảng này không có bất kỳ quan hệ thương mại nào.
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NI_TEACHINGS.map((teaching, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.1 }}
                  className="rounded-xl p-6 h-full"
                  style={{ border: `1px solid ${c.niCardBord}`, background: c.niCardBg, boxShadow: c.niCardShadow }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5"
                      style={{ borderColor: c.goldLine }}>
                      <span className="text-[9px]" style={{ color: c.goldSolid }}>{i + 1}</span>
                    </div>
                    <h3 className="text-sm font-medium leading-relaxed" style={{ color: c.goldSolid }}>{teaching.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed pl-8" style={{ color: c.textSecond }}>{teaching.body}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Hợp bàn section ══════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-10 lg:px-14 py-20">
        <div className="mx-auto" style={{ maxWidth: '1280px' }}>
          <div className="rounded-2xl p-10 md:p-14 text-center"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${c.cardBorder}`,
              boxShadow: c.cardShadow,
            }}>
            <FadeIn>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8" style={{ background: c.goldLine }} />
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Compatibility · Analysis</span>
                <div className="h-px w-8" style={{ background: c.goldLine }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-4 tracking-tight`}
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)' }}>
                Hợp Bàn Tử Vi
              </h2>
              <p className="text-sm leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: c.textSecond }}>
                Nhập thông tin ngày sinh của hai người, AI dựa trên hệ Ni Hải Hạ phân tích hôn nhân cung đối chiếu, tương thích mệnh cung và tương tác tam phương tứ chính,<br className="hidden md:block" />
                đưa ra độ hợp tình cảm, khả năng hợp tác và lời khuyên cách sống phù hợp nhất.
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {['Phân tích độ hợp tình cảm', 'Đánh giá hợp tác kinh doanh', 'Duyên phận cha mẹ con cái', 'Đánh giá tính cách trước hôn nhân'].map(item => (
                  <span key={item} style={{
                    fontSize: '12px', padding: '5px 14px', borderRadius: '20px',
                    background: theme === 'dark' ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.12)',
                    border: `1px solid ${c.goldLine}`,
                    color: c.goldSolid,
                  }}>
                    {item}
                  </span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/heming')}
                className="px-10 py-3 font-medium text-sm tracking-widest rounded-full"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(140,100,20,0.1)',
                  border: `1px solid ${c.goldLine}`,
                  color: c.goldSolid,
                  cursor: 'pointer',
                }}>
                Bắt đầu phân tích hợp bàn
              </motion.button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ Final CTA ══════════════════════════════════════ */}
      <section className="relative z-10 py-40 px-6 text-center" style={{ background: c.altSection }}>
        <FadeIn>
          <p className="text-[10px] tracking-[0.6em] uppercase mb-6" style={{ color: c.tagText }}>Bắt đầu hành trình lá số của bạn</p>
          <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-8 tracking-tight leading-tight`}
            style={{ fontSize: 'clamp(32px, 5vw, 60px)' }}>
            Lá số Tử Vi của bạn<br />đang chờ giải đọc
          </h2>
          <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: c.textSecond }}>
            Nhập ngày tháng năm giờ sinh, tạo lá số riêng của bạn chỉ trong vài giây<br />
            rồi để AI giải đọc sâu theo hệ thống Ni Hải Hạ
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="px-14 py-4 font-semibold text-base tracking-widest rounded-full"
            style={{ background: c.ctaBg, color: c.ctaText }}>
            Lập lá số miễn phí
          </motion.button>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <motion.a
              href="/knowledge"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>
              ✦ Kho kiến thức Tử Vi →
            </motion.a>
            <motion.a
              href="/library"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>
              📜 Thư viện cổ tịch →
            </motion.a>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6"
        style={{ borderTop: `1px solid ${c.niCardBord}` }}>
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-[9px] tracking-[0.3em] text-center mb-4 uppercase"
            style={{ color: c.textMuted, opacity: 0.6 }}>
            Phương pháp luận thầy Ni · Hệ thống học thuật
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {SECTIONS.map(s => {
              const ready = s.status === 'ready';
              return (
                <a
                  key={s.key}
                  href={ready ? '/chart' : undefined}
                  onClick={ready ? undefined : (e) => e.preventDefault()}
                  className="rounded-lg px-3 py-3 text-center transition-all"
                  style={{
                    background: ready ? c.starBg : 'transparent',
                    border: `1px ${ready ? 'solid' : 'dashed'} ${ready ? c.goldLine : c.navBorder}`,
                    cursor: ready ? 'pointer' : 'not-allowed',
                    opacity: ready ? 1 : 0.5,
                    textDecoration: 'none',
                  }}
                >
                  <div className="text-base font-semibold mb-0.5 tracking-[0.1em]"
                    style={{ color: ready ? c.goldSolid : c.textMuted }}>
                    {s.name}
                  </div>
                  <div className="text-[9px] tracking-wider"
                    style={{ color: ready ? '#10b981' : c.textMuted }}>
                    {ready ? '✓ Đã ra mắt' : `Mở ${s.when}`}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-wider mb-3" style={{ color: c.footerText }}>
            Tử Vi Mệnh Bàn · Dựa trên hệ thống chính thống Ni Hải Hạ · Chỉ mang tính tham khảo, vận mệnh nằm trong tay bạn
          </p>
          <p className="text-[10px] tracking-wider mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: c.footerText, opacity: 0.85 }}>
            Nền tảng này dựa trên nghiên cứu văn hóa truyền thống, chỉ cung cấp tham khảo học tập.<br className="sm:hidden" />
            Không cấu thành bất kỳ lời khuyên y tế, đầu tư, pháp lý hay quyết định quan trọng nào.
          </p>
          <p className="text-[10px] tracking-wider" style={{ color: c.footerText }}>
            <a href="/terms" style={{ color: c.footerText, textDecoration: 'underline' }}>Điều khoản dịch vụ</a>
            {' · '}
            <a href="/privacy" style={{ color: c.footerText, textDecoration: 'underline' }}>Chính sách bảo mật</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

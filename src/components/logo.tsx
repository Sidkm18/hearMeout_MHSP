import Link from 'next/link';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="w-16 h-16">
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M79.9999 96.2401C79.9999 96.2401 81.5999 97.2267 84.7999 96.2401C87.9999 95.2534 91.1999 92.2934 91.1999 88.3201C91.1999 84.3467 91.1999 81.3867 91.1999 81.3867" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M68.8001 81.3867C68.8001 81.3867 68.8001 84.3467 68.8001 88.3201C68.8001 92.2934 72.0001 95.2534 75.2001 96.2401C78.4001 97.2267 80.0001 96.2401 80.0001 96.2401" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M72.48 88.4267C72.48 88.4267 73.6 89.28 75.2 89.6C76.8 89.92 82.08 89.92 84 89.6C85.92 89.28 87.52 88.4267 87.52 88.4267" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M80 96.2401V102" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M70.48 64.1066C70.48 64.1066 68.88 64.4266 67.84 66.0266C66.8 67.6266 65.2 75.6266 65.2 75.6266" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M89.52 64.1066C89.52 64.1066 91.12 64.4266 92.16 66.0266C93.2 67.6266 94.8 75.6266 94.8 75.6266" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M103.2 59.2C103.2 59.2 105.6 52 100.8 47.2C96 42.4 89.6 42.4 89.6 42.4" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M100.8 47.2C100.8 47.2 101.92 50.8 98.72 52.64C95.52 54.48 91.2 52.8 91.2 52.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 36C96 36 100.8 33.6 103.2 38.4C105.6 43.2 101.6 48.8 101.6 48.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M101.6 48.8C101.6 48.8 103.2 46.88 102.08 44C100.96 41.12 97.6 40.8 97.6 40.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M108 51.2C108 51.2 113.6 48.8 116.8 53.6C120 58.4 116.8 64.8 116.8 64.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M116.8 64.8C116.8 64.8 118.4 62.88 117.28 60C116.16 57.12 112.8 56.8 112.8 56.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M56.4001 42.4C56.4001 42.4 60.0001 42.4 64.8001 47.2C69.6001 52 67.2001 59.2 67.2001 59.2" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M64.8 47.2C64.8 47.2 61.6 50.8 64.8 52.64C68 54.48 72.32 52.8 72.32 52.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 36C60 36 55.2 33.6 52.8 38.4C50.4 43.2 54.4 48.8 54.4 48.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M54.4001 48.8C54.4001 48.8 52.8001 46.88 53.9201 44C55.0401 41.12 58.4001 40.8 58.4001 40.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M48 51.2C48 51.2 42.4 48.8 39.2 53.6C36 58.4 39.2 64.8 39.2 64.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M39.2001 64.8C39.2001 64.8 37.6001 62.88 38.7201 60C39.8401 57.12 43.2001 56.8 43.2001 56.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 99.2C96 99.2 99.2 102.4 96 104C92.8 105.6 90.4 104 90.4 104" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 104C96 104 98.4 106.4 93.6 108.8C88.8 111.2 84.8 110.4 84.8 110.4" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M99.2 110.4C99.2 110.4 104 112.8 101.6 116.8C99.2 120.8 95.2 120.8 95.2 120.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M64 99.2C64 99.2 60.8 102.4 64 104C67.2 105.6 69.6 104 69.6 104" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M64 104C64 104 61.6 106.4 66.4 108.8C71.2 111.2 75.2 110.4 75.2 110.4" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M60.8 110.4C60.8 110.4 56 112.8 58.4 116.8C60.8 120.8 64.8 120.8 64.8 120.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M94.4 67.2V62.4H65.6V67.2C65.6 67.2 62.4 79.2 80 79.2C97.6 79.2 94.4 67.2 94.4 67.2Z" fill="#A7B5FF" />
          <path d="M94.4 67.2V62.4H65.6V67.2C65.6 67.2 62.4 79.2 80 79.2C97.6 79.2 94.4 67.2 94.4 67.2Z" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M80 57.6V44.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M86.4 44.8C86.4 44.8 84.8 48 80 48C75.2 48 73.6 44.8 73.6 44.8" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M80 32C84.4183 32 88 28.4183 88 24C88 19.5817 84.4183 16 80 16C75.5817 16 72 19.5817 72 24C72 28.4183 75.5817 32 80 32Z" fill="#A7B5FF" />
          <path d="M80 44.8V32" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M91.2 52.8C91.2 52.8 92.8 56 89.6 57.6C86.4 59.2 84.8 57.6 84.8 57.6" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M72.32 52.8C72.32 52.8 70.72 56 73.92 57.6C77.12 59.2 78.72 57.6 78.72 57.6" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M108.8 69.6C108.8 69.6 112 72.8 108.8 74.4C105.6 76 103.2 74.4 103.2 74.4" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M47.2 74.4C47.2 74.4 44 72.8 47.2 69.6C50.4 66.4 52 68 52 68" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M99.2 81.6C99.2 81.6 103.2 84 100.8 88C98.4 92 95.2 91.2 95.2 91.2" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <path d="M60.8 81.6C60.8 81.6 56.8 84 59.2 88C61.6 92 64.8 91.2 64.8 91.2" stroke="#A7B5FF" strokeWidth="2" strokeLinecap="round" />
          <text fill="hsl(var(--primary))" style={{ transform: 'translate(28px, 145px)', fontSize: '20px', fontFamily: 'Cormorant Garamond, serif', fontWeight: 'bold', letterSpacing: '2px' }}>
            <textPath id="curve" d="M 0,0 A 50,22 0 1,1 100,0">HearMeout</textPath>
          </text>
        </svg>
      </div>
    </Link>
  );
};

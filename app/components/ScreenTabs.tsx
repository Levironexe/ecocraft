'use client';

interface ScreenTabsProps {
  activeScreen: 1 | 2;
  onTabChange: (screen: 1 | 2) => void;
}

const tabs = [
  { screen: 1 as const, label: 'Chọn Vật Liệu' },
  { screen: 2 as const, label: 'Xưởng Chế Tạo' },
];

export function ScreenTabs({ activeScreen, onTabChange }: ScreenTabsProps) {
  return (
    <div className="flex gap-0 mx-[16px] mt-[4px]">
      {tabs.map((tab) => (
        <button
          key={tab.screen}
          onClick={() => onTabChange(tab.screen)}
          className={`text-[18px] py-[4px] px-[18px] border-[var(--pixel)] border-solid border-b-0 cursor-pointer transition-all relative ${
            activeScreen === tab.screen
              ? 'bg-[var(--bg-card)] text-[var(--primary-dark)] z-[2] border-t-[var(--primary)]'
              : 'bg-[var(--bg-warm)] text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--bg-warm)]'
          }`}
          style={{
            borderColor: activeScreen === tab.screen ? undefined : 'var(--border-dark)',
            borderTopColor: activeScreen === tab.screen ? 'var(--primary)' : undefined,
            top: 'var(--pixel)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

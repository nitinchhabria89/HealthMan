export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <div
      className="bg-blue flex items-center justify-center text-white font-black shrink-0"
      style={{ width: size, height: size, borderRadius: size * 0.32, fontSize: size * 0.55 }}
    >
      N
    </div>
  );
}

export function LogoFull({ iconSize = 40 }: { iconSize?: number }) {
  return (
    <div className="flex items-center gap-3">
      <LogoIcon size={iconSize} />
      <span className="font-black tracking-tight" style={{ fontSize: iconSize * 0.5 }}>
        <span className="text-text">NITIN</span> <span className="text-blue">CHHABRIA</span>
      </span>
    </div>
  );
}

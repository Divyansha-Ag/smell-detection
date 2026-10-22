const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const CheckIcon = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16 9.5" /></svg>);
export const WarnIcon = (p) => (<svg {...base} {...p}><path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" /><path d="M12 10v4.2M12 17h.01" /></svg>);
export const CopyIcon = (p) => (<svg {...base} {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>);
export const DownloadIcon = (p) => (<svg {...base} {...p}><path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14" /></svg>);
export const UploadIcon = (p) => (<svg {...base} {...p}><path d="M12 16V5M7.5 9 12 4.5 16.5 9M5 20h14" /></svg>);

export function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <rect width="30" height="30" rx="8" fill="#14597A" />
      <rect x="8" y="8.5" width="14" height="2.2" rx="1.1" fill="#fff" opacity=".9" />
      <rect x="8" y="13.5" width="14" height="4" rx="1.4" fill="#FFE08A" />
      <rect x="8" y="20" width="9" height="2.2" rx="1.1" fill="#fff" opacity=".9" />
    </svg>
  );
}
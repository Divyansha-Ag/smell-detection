import { LogoMark } from "./Icons";

export default function TopBar({ online }) {
  const state = online === null ? "checking" : online ? "online" : "offline";
  const label = { checking: "Checking backend", online: "Backend online", offline: "Backend offline" }[state];
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="brand">
          <LogoMark />
          <div>
            <div className="brand__name">SRS Review</div>
            <div className="brand__sub">Find unclear requirements before development does</div>
          </div>
        </div>
        <div className="status" data-state={state} role="status">
          <span className="status__dot" />
          {label}
        </div>
      </div>
    </header>
  );
}
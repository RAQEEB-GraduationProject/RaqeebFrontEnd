import raqeebLogo from "../../assets/raqeeb-logo.png";

// The official RAQEEB logo, transparent background (for light surfaces).
// Size it by height only (e.g. className="h-11"): the width follows, so the
// artwork is never distorted. width/height are the file's pixel size.
const Logo = ({ className = "h-11" }) => (
  <img
    src={raqeebLogo}
    alt="RAQEEB logo"
    width={361}
    height={170}
    className={`w-auto max-w-none shrink-0 ${className}`}
  />
);

export default Logo;

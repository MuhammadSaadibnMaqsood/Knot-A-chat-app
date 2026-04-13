
const Avatar = ({ name = "", size = 36 }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue},50%,35%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        color: "#fff",
        flexShrink: 0,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {initials}
    </div>
  );
};
export default Avatar;
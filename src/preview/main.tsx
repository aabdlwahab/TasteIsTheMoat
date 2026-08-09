import { createRoot } from "react-dom/client";
import "../ui/theme.css";
import { getShader } from "../shaders/index";
import { ShaderSection } from "../ui/ShaderSection";

const brand = {
  primary: "#f97316",
  secondary: "#f43f5e",
  accent: "#bef264",
  background: "#080706",
};

function ShaderPreview() {
  const requested = new URLSearchParams(window.location.search).get("shader") ?? "mesh-gradient";
  const shader = getShader(requested) ?? getShader("mesh-gradient")!;

  return (
    <ShaderSection
      as="div"
      shader={shader}
      brand={brand}
      scrim="none"
      maxDpr={1.25}
      className="h-screen w-screen bg-[#080706]"
      contentClassName="h-full"
    />
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<ShaderPreview />);

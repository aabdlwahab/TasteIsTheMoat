import { createRoot } from "react-dom/client";
import "../../src/ui/theme.css";
import { Page } from "./page";

const root = document.getElementById("root");
if (root) createRoot(root).render(<Page />);

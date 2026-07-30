import { createRoot } from "react-dom/client";
import "../../src/ui/theme.css";
import { TemplateCatalog, TEMPLATES } from "./pages";

const template = new URLSearchParams(location.search).get("template");
const Page = template ? TEMPLATES[template] : undefined;
const root = document.getElementById("root");

if (root) createRoot(root).render(Page ? <Page /> : <TemplateCatalog />);

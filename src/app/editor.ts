import { EditorView, basicSetup } from "codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";

export interface Editor {
  view: EditorView;
  getDoc(): string;
  setDoc(doc: string): void;
}

/**
 * A small CodeMirror wrapper configured for editing GLSL. C++ highlighting is
 * a close enough match for GLSL keywords, types and numbers. `onChange` only
 * fires for real user edits, not programmatic `setDoc` calls.
 */
export function createEditor(
  parent: HTMLElement,
  initialDoc: string,
  onChange: (doc: string) => void,
): Editor {
  let suppress = false;

  const theme = EditorView.theme({
    "&": { height: "100%", fontSize: "13px", backgroundColor: "transparent" },
    ".cm-scroller": {
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      lineHeight: "1.55",
    },
    ".cm-gutters": { backgroundColor: "transparent", border: "none" },
    "&.cm-focused": { outline: "none" },
  });

  const view = new EditorView({
    doc: initialDoc,
    parent,
    extensions: [
      basicSetup,
      cpp(),
      oneDark,
      theme,
      EditorView.lineWrapping,
      EditorView.updateListener.of((u) => {
        if (u.docChanged && !suppress) onChange(u.state.doc.toString());
      }),
    ],
  });

  return {
    view,
    getDoc: () => view.state.doc.toString(),
    setDoc(doc: string) {
      suppress = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: doc },
      });
      suppress = false;
    },
  };
}

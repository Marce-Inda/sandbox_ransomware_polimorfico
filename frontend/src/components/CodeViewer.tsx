import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Code, AlertCircle, FileCode } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const { activeLevel, levelsList, selectedAgentId } = useSimStore();

  if (levelsList.length === 0) return null;

  const activeLevelData = levelsList.find(l => l.level === activeLevel) || levelsList[0];
  
  // Si hay un agente seleccionado, mostrar su código correspondiente, sino mostrar el del nivel activo
  const targetAgent = selectedAgentId || activeLevelData.agent;
  
  // Buscar si hay código de nivel asociado al agente seleccionado
  const levelForAgent = levelsList.find(l => l.agent === targetAgent) || activeLevelData;
  const codeContent = levelForAgent.vulnerable_code;

  // Simple static Python code syntax highlighter
  const highlightPython = (code: string) => {
    if (!code) return '';
    
    // 1. Escape HTML
    let escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const commentsMap: { [key: string]: string } = {};
    const stringsMap: { [key: string]: string } = {};
    const keywordsMap: { [key: string]: string } = {};
    const functionsMap: { [key: string]: string } = {};
    let placeholderCounter = 0;

    // 2. Extract comments
    escaped = escaped.replace(/(#[^\n]*)/g, (match) => {
      const id = `__COMMENT_PLACEHOLDER_${placeholderCounter++}__`;
      commentsMap[id] = match;
      return id;
    });

    // 3. Extract strings
    escaped = escaped.replace(/(['"])(.*?)\1/g, (match) => {
      const id = `__STRING_PLACEHOLDER_${placeholderCounter++}__`;
      stringsMap[id] = match;
      return id;
    });

    // 4. Extract keywords (safe, no HTML tag attributes exist yet)
    const keywords = [
      'def', 'return', 'if', 'else', 'elif', 'import', 'from', 'class', 'for', 'in', 'while', 
      'not', 'and', 'or', 'True', 'False', 'None', 'as'
    ];
    keywords.forEach(kw => {
      const reg = new RegExp(`\\b(${kw})\\b`, 'g');
      escaped = escaped.replace(reg, (match) => {
        const id = `__KEYWORD_PLACEHOLDER_${placeholderCounter++}__`;
        keywordsMap[id] = match;
        return id;
      });
    });

    // 5. Extract functions/builtins
    const functions = [
      'print', 'len', 'dict', 'str', 'int', 'list', 'isinstance', 'is_valid_email',
      'classify_prompt_with_gemini', 'diagnose_payload', 'execute_simulation_step'
    ];
    functions.forEach(fn => {
      const reg = new RegExp(`\\b(${fn})\\b`, 'g');
      escaped = escaped.replace(reg, (match) => {
        const id = `__FUNCTION_PLACEHOLDER_${placeholderCounter++}__`;
        functionsMap[id] = match;
        return id;
      });
    });

    // 6. Restore everything with HTML tags in a single safe pass
    Object.keys(functionsMap).forEach(id => {
      const val = functionsMap[id];
      escaped = escaped.replace(id, `<span class="text-cyan-400 font-bold">${val}</span>`);
    });

    Object.keys(keywordsMap).forEach(id => {
      const val = keywordsMap[id];
      escaped = escaped.replace(id, `<span class="text-pink-500 font-bold">${val}</span>`);
    });

    Object.keys(stringsMap).forEach(id => {
      const val = stringsMap[id];
      escaped = escaped.replace(id, `<span class="text-green-400">${val}</span>`);
    });

    Object.keys(commentsMap).forEach(id => {
      const val = commentsMap[id];
      escaped = escaped.replace(id, `<span class="text-slate-500 italic">${val}</span>`);
    });

    return <code className="block select-text whitespace-pre animate-fade-in" dangerouslySetInnerHTML={{ __html: escaped }} />;
  };


  return (
    <div className="cyber-panel w-full h-full flex flex-col p-4 bg-slate-950/80 border-cyan-500/20 text-slate-200 rounded-lg crt-overlay">
      
      {/* HEADER DE LA VENTANA EDITOR */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2 select-none z-10">
        <div className="flex items-center gap-2">
          {/* Visual terminal control dots */}
          <div className="flex gap-1 pr-1.5 border-r border-slate-900">
            <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
            <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
            <span className="w-2 h-2 rounded-full bg-green-500/80"></span>
          </div>
          <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-1.5 font-mono">
            <Code className="w-4 h-4 text-cyan-500" /> CÓDIGO FUENTE (WHITE-BOX REVIEW)
          </h2>
        </div>
        <span className="text-[9px] text-slate-500 font-mono bg-slate-950 border border-slate-900 px-1.5 py-0.2 rounded flex items-center gap-1">
          <FileCode className="w-3 h-3 text-cyan-400" /> {targetAgent}.py
        </span>
      </div>

      {/* TEXT AREA / SYNTAX VIEW */}
      <div className="flex-1 bg-slate-950/90 border border-slate-900 rounded-lg p-3 overflow-auto font-mono text-[10.5px] leading-relaxed relative min-h-[150px]">
        {/* Editor source header watermark */}
        <div className="absolute top-2 right-3 text-[8px] text-slate-700 select-none">
          INTERNAL_LOGIC_AUDIT_V3
        </div>
        
        {highlightPython(codeContent)}
      </div>

      {/* DIDACTIC EXPLANATION PANEL */}
      <div className="mt-3 p-2.5 bg-red-500/5 border border-red-500/20 rounded-lg flex gap-2.5 items-start font-mono text-[9px] leading-relaxed text-red-400 z-10 select-none">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-red-500 uppercase font-bold tracking-wider">Célula Semántica Vulnerable:</strong> La vulnerabilidad de inyección ocurre cuando las entradas no sanitizadas del usuario se concatenan directamente en las plantillas de prompts de la base de datos (RAG). Para mitigar esto, fuerza esquemas estructurados de salida o validación por firmas.
        </div>
      </div>
      
    </div>
  );
};
